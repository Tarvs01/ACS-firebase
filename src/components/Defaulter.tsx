import {
  useState,
  FormEvent,
  ChangeEvent,
  useEffect,
  useContext,
} from "react";
import { DefaulterDetails, StaffData } from "./types";
import { AnimatePresence, motion } from "framer-motion";
import { db } from "../utils/firebase";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { AppContext } from "./AppProvider";

function Defaulter({
  props,
  openDefaulter,
  staffData,
}: DefaulterDetails) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [offenceDetails, setOffenceDetails] = useState({
    description: "",
    date: "",
  });
  const [error, setError] = useState("error");

  const context = useContext(AppContext);

  //handler function for the new offence form submission
  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const newState: StaffData["defaulters"] = staffData.defaulters.map(
      (val) => {
        if (val.id === props.id) {
          val.offences.push({
            id: val.offences.length,
            description: offenceDetails.description,
            date: offenceDetails.date,
          });
        }
        return val;
      }
    );

    updateDoc(doc(db, `staff/${context!.currentStaffUID}`), {
      defaulters: newState,
    })
      .then((response) => {
        console.log("Successfully updated defaulters");
        console.log(response);
        setIsFormOpen(!isFormOpen);
      })
      .catch((error) => {
        console.log("there was an error updating the defaulters");
        console.log(error);
        setError("There was an error. Try again");
      });
  }

  //function handler for the form input element
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setError("");
    setOffenceDetails({ ...offenceDetails, [e.target.name]: e.target.value });
  }

  //function handler for the form textarea element
  function handleTextareaChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setError("");
    setOffenceDetails({ ...offenceDetails, [e.target.name]: e.target.value });
  }

  //function for removing an offenders offence
  async function removeOffence(id: number) {
    //update the staff state
    let newState: StaffData["defaulters"] = staffData.defaulters.map((val) => {
      if (val.id === props.id) {
        val.offences = val.offences.filter((value) => value.id !== id);
      }
      return val;
    });

    //filter out the offence from the other offences

    //if the offender no longer has any offence, remove the offender from the list
    let clearedMatricNumber = "";
    newState = newState.filter((val) => {
      if (val.offences.length === 0) {
        clearedMatricNumber = val.matricNumber.split("/").join("-");
        return false;
      }
      return true;
    });

    updateDoc(doc(db, `staff/${context!.currentStaffUID}`), {
      defaulters: newState,
    })
      .then((response) => {
        console.log("Successfully updated defaulters");
        console.log(response);
      })
      .catch((error) => {
        console.log("there was an error updating the defaulters");
        console.log(error);
        alert("There was an error updating the offences");
      });

    //update the database
    if (clearedMatricNumber) {
      let staffPosition = "";
      if (staffData.dept?.startsWith("dept")) {
        staffPosition = staffData.dept.slice(0, staffData.dept.length - 3);
      } else {
        staffPosition = staffData.dept;
      }
      const matricSplit = clearedMatricNumber.split("-");
      let studentRef = doc(
        db,
        `students/${2000 + Number(matricSplit[1]) + 5}/${matricSplit[0]}`,
        `${matricSplit.join("-")}`
      );
      let studentSnap = await getDoc(studentRef);

      if (studentSnap.exists()) {
        updateDoc(studentRef, { [staffPosition]: "default" })
          .then(() => {
            console.log("successfully removed defaulter");
          })
          .catch((error) => {
            console.log(error);
            console.log("there was an error updating the students data");
          });
      } else {
        studentRef = doc(
          db,
          `students/${2000 + Number(matricSplit[1]) + 4}/${matricSplit[0]}`,
          `${matricSplit.join("-")}`
        );
        studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
          updateDoc(studentRef, { [staffPosition]: "default" })
            .then(() => {
              console.log("successfully removed defaulter");
            })
            .catch((error) => {
              console.log(error);
              console.log("there was an error updating the students data");
            });
        } else {
          studentRef = doc(
            db,
            `students/${2000 + Number(matricSplit[1]) + 3}/${matricSplit[0]}`,
            `${matricSplit.join("-")}`
          );
          studentSnap = await getDoc(studentRef);

          if (studentSnap.exists()) {
            updateDoc(studentRef, { [staffPosition]: "default" })
              .then(() => {
                console.log("successfully removed defaulter")
              })
              .catch((error) => {
                console.log(error);
                console.log("there was an error updating the students data");
              });
          } else {
            console.log("No such record found in the database");
          }
        }
      }
    }
  }

  //close other open defaulter components when this one is opened
  useEffect(() => {
    if (isOpen) {
      openDefaulter(setIsOpen, props.id);
    }
  }, [isOpen, openDefaulter, props.id]);

  return (
    <div className="defaulter-cont">
      <div className="main-cont">
        <div className="matric-number-tile" onClick={() => setIsOpen(!isOpen)}>
          <p>{props.matricNumber}</p>
          <div
            className="arrow"
            style={{ transform: `rotate(${isOpen ? "0deg" : "-90deg"})` }}
          >
            <svg
              height="57.5"
              viewBox="0 0 95 57.5"
              width="95"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 10.1C0 7.5 1 5 2.9 3 6.8-.9 13.2-.9 17.1 3l30.4 30.3L77.9 2.9C81.8-1 88.2-1 92.1 2.9s3.9 10.3 0 14.2L54.6 54.6c-1.9 1.9-4.4 2.9-7.1 2.9s-5.2-1.1-7.1-2.9L2.9 17.2C1 15.2 0 12.6 0 10.1z"
                fill="inherit"
              ></path>
            </svg>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="offences-cont"
              initial={{ height: "0px" }}
              animate={{ height: "auto" }}
              exit={{ height: "0px" }}
            >
              {props.offences.map((value) => {
                return (
                  <div className="offence-cont" key={value.id}>
                    <h3>Details</h3>
                    <p>{value.description}</p>

                    <h3>Date</h3>
                    <p>{value.date}</p>

                    <button
                      onClick={() => {
                        removeOffence(value.id);
                        console.log("remove called");
                      }}
                    >
                      Clear offence
                    </button>
                  </div>
                );
              })}

              {isFormOpen && (
                <form onSubmit={handleSubmit} className="add-new-offence-form">
                  <label htmlFor="description">Description</label>
                  <textarea
                    name="description"
                    id="description"
                    rows={6}
                    onChange={handleTextareaChange}
                    required
                  ></textarea>

                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    onChange={handleInputChange}
                  />
                  <p className="login-error-message">{error}</p>
                  <button type="submit">Add Offence</button>
                </form>
              )}
              {!isFormOpen && (
                <button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="add-new-offence-btn"
                >
                  Add New Offence
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Defaulter;
