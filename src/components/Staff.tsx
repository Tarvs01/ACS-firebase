import React, {
  useEffect,
  useState,
  FormEvent,
  ChangeEvent,
  useRef,
  useContext,
} from "react";
import Defaulter from "./Defaulter";
import { StaffData } from "./types";
import Spinner from "./Spinner";
import { AppContext } from "./AppProvider";
import {
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  query,
  where,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "../utils/firebase";
import { signOut } from "firebase/auth";

function Staff() {
  const approveOneError = useRef<HTMLParagraphElement | null>(null);
  const approveOneSuccess = useRef<HTMLParagraphElement | null>(null);

  const addDefaulterError = useRef<HTMLParagraphElement | null>(null);
  const addDefaulterSuccess = useRef<HTMLParagraphElement | null>(null);

  const approveAllError = useRef<HTMLParagraphElement | null>(null);
  const approveAllSuccess = useRef<HTMLParagraphElement | null>(null);

  const [isAddDefaulterLoading, setIsAddDefaulterLoading] = useState(false);
  const [isApproveAllLoading, setIsApproveAllLoading] = useState(false);
  const [isApproveOneLoading, setIsApproveOneLoading] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const context = useContext(AppContext);

  const [staffData, setStaffData] = useState<StaffData>({
    dept: "",
    defaulters: [],
  });

  useEffect(() => {
    const q = doc(db, "staff", context!.currentStaffUID);
    const unsub = onSnapshot(q, (doc) => {
      const data: StaffData = doc.data() as StaffData;
      console.log("gotten data is:");
      console.log(data);
      setStaffData(data);
    });
    return () => unsub();
  }, [context]);

  const [newDefaulterData, setNewDefaulterData] = useState({
    matricNumber: "",
    description: "",
    date: "",
  });

  const [singleApprovalMatricNumber, setSingleApprovalMatricNumber] =
    useState("");

  //funtion handler for the Add Defaulter form submision
  async function addDefaulterSubmit(e: FormEvent) {
    e.preventDefault();

    //remove any previous error
    addDefaulterError.current!.textContent = "";

    //create a new offence based on the form data
    const offences = [];
    offences.push({
      id: 0,
      description: newDefaulterData.description,
      date: newDefaulterData.date,
    });

    //creata a new defaulter
    const newDefaulter = {
      id: staffData.defaulters.length,
      matricNumber: newDefaulterData.matricNumber,
      offences: offences,
    };

    //if the given matric number is invalid
    if (!/^([a-z]{3})(\/\d{2})(\/\d{4})$/.test(newDefaulterData.matricNumber)) {
      addDefaulterError.current!.textContent = "Invalid matric number"; //display an error message
    } else {
      //otherwise

      //check if the new defaulter has already been previosuly added
      const present = staffData.defaulters.find((value) => {
        return value.matricNumber === newDefaulterData.matricNumber;
      });

      //If they have been previously added
      if (present) {
        addDefaulterError.current!.textContent =
          "Defaulter already exists. Add to their offence instead";
      } else {
        //otherwise
        setIsAddDefaulterLoading(true); //display a spinner to signify loading

        const dept = staffData.dept.slice(staffData.dept.length - 3, staffData.dept.length);

        if(staffData.dept.startsWith("dept") && !newDefaulter.matricNumber.startsWith(dept)){
          setIsAddDefaulterLoading(false);
          addDefaulterError.current!.textContent = "You can only add defaulters of your own department";
        }
        else{
          let staffPosition = "";
          if (staffData.dept?.startsWith("dept")) {
            staffPosition = staffData.dept.slice(0, staffData.dept.length - 3);
          } else {
            staffPosition = staffData.dept;
          }
          const matricSplit = newDefaulterData.matricNumber.split("/");
          let studentRef = doc(
            db,
            `students/${2000 + Number(matricSplit[1]) + 5}/${matricSplit[0]}`,
            `${matricSplit.join("-")}`
          );
          let studentSnap = await getDoc(studentRef);
  
          if (studentSnap.exists()) {
            updateDoc(studentRef, { [staffPosition]: "UI" })
              .then(() => {
                const staffRef = doc(db, "staff", context!.currentStaffUID);
  
                updateDoc(staffRef, {
                  defaulters: arrayUnion(newDefaulter),
                })
                  .then((response) => {
                    console.log(response);
                    console.log("defaulter successfully added to staff");
                    setIsAddDefaulterLoading(false); //hide the loading spinner
  
                    addDefaulterSuccess.current!.textContent =
                      "Successfully added defaulter"; //display a success message
  
                    //reset the form values
                    setNewDefaulterData({
                      matricNumber: "",
                      description: "",
                      date: "",
                    });
  
                    setTimeout(() => {
                      addDefaulterSuccess.current!.textContent = "";
                    }, 2000);
                  })
                  .catch((error) => {
                    console.log(error);
                    console.log(
                      "There was an error adding the defaulter to staff"
                    );
                    setIsAddDefaulterLoading(false); //hide the loading spinner
                    addDefaulterError.current!.textContent =
                      "There was an error. Try again"; //display an error message
                  });
              })
              .catch((error) => {
                console.log(error);
                console.log("there was an error updating the students data");
                setIsAddDefaulterLoading(false); //hide the loading spinner
                addDefaulterError.current!.textContent =
                  "There was an error adding to the student. Try again"; //display an error message
              });
          } else {
            studentRef = doc(
              db,
              `students/${2000 + Number(matricSplit[1]) + 4}/${matricSplit[0]}`,
              `${matricSplit.join("-")}`
            );
            studentSnap = await getDoc(studentRef);
  
            if (studentSnap.exists()) {
              updateDoc(studentRef, { [staffPosition]: "UI" })
                .then(() => {
                  const staffRef = doc(db, "staff", context!.currentStaffUID);
  
                  updateDoc(staffRef, {
                    defaulters: arrayUnion(newDefaulter),
                  })
                    .then((response) => {
                      console.log(response);
                      console.log("defaulter successfully added to staff");
                      setIsAddDefaulterLoading(false); //hide the loading spinner
  
                      addDefaulterSuccess.current!.textContent =
                        "Successfully added defaulter"; //display a success message
  
                      //reset the form values
                      setNewDefaulterData({
                        matricNumber: "",
                        description: "",
                        date: "",
                      });
  
                      setTimeout(() => {
                        addDefaulterSuccess.current!.textContent = "";
                      }, 2000);
                    })
                    .catch((error) => {
                      console.log(error);
                      console.log(
                        "There was an error adding the defaulter to staff"
                      );
                      setIsAddDefaulterLoading(false); //hide the loading spinner
                      addDefaulterError.current!.textContent =
                        "There was an error. Try again"; //display an error message
                    });
                })
                .catch((error) => {
                  console.log(error);
                  console.log("there was an error updating the students data");
                  setIsAddDefaulterLoading(false); //hide the loading spinner
                  addDefaulterError.current!.textContent =
                    "There was an error adding to the student. Try again"; //display an error message
                });
            } else {
              studentRef = doc(
                db,
                `students/${2000 + Number(matricSplit[1]) + 3}/${matricSplit[0]}`,
                `${matricSplit.join("-")}`
              );
              studentSnap = await getDoc(studentRef);
  
              if (studentSnap.exists()) {
                updateDoc(studentRef, { [staffPosition]: "UI" })
                  .then(() => {
                    const staffRef = doc(db, "staff", context!.currentStaffUID);
  
                    updateDoc(staffRef, {
                      defaulters: arrayUnion(newDefaulter),
                    })
                      .then((response) => {
                        console.log(response);
                        console.log("defaulter successfully added to staff");
                        setIsAddDefaulterLoading(false); //hide the loading spinner
  
                        addDefaulterSuccess.current!.textContent =
                          "Successfully added defaulter"; //display a success message
  
                        //reset the form values
                        setNewDefaulterData({
                          matricNumber: "",
                          description: "",
                          date: "",
                        });
  
                        setTimeout(() => {
                          addDefaulterSuccess.current!.textContent = "";
                        }, 2000);
                      })
                      .catch((error) => {
                        console.log(error);
                        console.log(
                          "There was an error adding the defaulter to staff"
                        );
                        setIsAddDefaulterLoading(false); //hide the loading spinner
                        addDefaulterError.current!.textContent =
                          "There was an error. Try again"; //display an error message
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    console.log("there was an error updating the students data");
                    setIsAddDefaulterLoading(false); //hide the loading spinner
                    addDefaulterError.current!.textContent =
                      "There was an error adding to the student. Try again"; //display an error message
                  });
              } else {
                console.log("No such record found in the database");
                setIsAddDefaulterLoading(false); //hide the loading spinner
                addDefaulterError.current!.textContent =
                  "No such matric number was found"; //display an error message
              }
            }
          }
        }

      }
    }
  }

  //input change handler for the add defaulter form
  function addDefaulterInputChange(e: ChangeEvent<HTMLInputElement>) {
    setNewDefaulterData({
      ...newDefaulterData,
      [e.target.name]: e.target.value,
    });
  }

  //textarea change handler for the add defaulter form
  function addDefaulterTextareaChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setNewDefaulterData({
      ...newDefaulterData,
      [e.target.name]: e.target.value,
    });
  }

  //function handler for the approve all form
  async function approveAll() {
    setIsApproveAllLoading(true); //display a loading spinner

    if(staffData.dept.startsWith("dept")){
      try {
        const currentYearRef = doc(db, "schoolDetails", "currentYear");
        const currentYearSnap = await getDoc(currentYearRef);
  
        if (currentYearSnap.exists()) {
          const currentYear = String(currentYearSnap.data().year);
  
          const departmentsRef = doc(db, "schoolDetails", currentYear);
          const departmentsSnap = await getDoc(departmentsRef);
  
          if (departmentsSnap.exists()) {
            console.log("The current departments are:");
            console.log(departmentsSnap.data().departments);
            const departmentsArray: string[] = [staffData.dept.slice(staffData.dept.length - 3)];

            if(departmentsSnap.data().departments.includes(departmentsArray[0])){
              
              let staffPosition = "";
              if (staffData.dept?.startsWith("dept")) {
                staffPosition = staffData.dept.slice(0, staffData.dept.length - 3);
              } else {
                staffPosition = staffData.dept;
              }
    
              departmentsArray.map(async (department) => {
                const q = query(
                  collection(db, `students/${currentYear}/${department}`),
                  where(`${staffPosition}`, "!=", "UI")
                );
                const querySnapshot = await getDocs(q);
    
                console.log(`defaulters for ${department} are:`);
                const batch = writeBatch(db);
    
                querySnapshot.forEach((eachDoc) => {
                  const studentRef = doc(
                    db,
                    `students/${currentYear}/${department}`,
                    `${eachDoc.data().matricNumber}`
                  );
                  batch.update(studentRef, { [staffPosition]: "approved" });
                });
    
                batch
                  .commit()
                  .then((response) => {
                    setIsApproveAllLoading(false);
                    console.log(response);
                    console.log("successfully approved all");
                    approveAllSuccess.current!.textContent =
                      "Successfully approved all";
                  })
                  .catch((error) => {
                    setIsApproveAllLoading(false);
                    console.log(error);
                    console.log("failed to approve all");
                    approveAllError.current!.textContent =
                      "Failed to approve all. Try again";
                  });
              });
            } else {
              approveAllError.current!.textContent =
                "No department has been set for the current year";
            }
            }
            else{
              setIsApproveAllLoading(false);
          approveAllError.current!.textContent =
            "You have no registered student for the current year";
            }
  
        } else {
          setIsApproveAllLoading(false);
          approveAllError.current!.textContent =
            "The current year has not been set. Please contact the admin.";
        }
      } catch (error) {
        setIsApproveAllLoading(false);
        console.log(error);
        approveAllError.current!.textContent = "There was an error. Try again";
      }
    }
    else{
      try {
        const currentYearRef = doc(db, "schoolDetails", "currentYear");
        const currentYearSnap = await getDoc(currentYearRef);
  
        if (currentYearSnap.exists()) {
          const currentYear = String(currentYearSnap.data().year);
  
          const departmentsRef = doc(db, "schoolDetails", currentYear);
          const departmentsSnap = await getDoc(departmentsRef);
  
          if (departmentsSnap.exists()) {
            console.log("The current departments are:");
            console.log(departmentsSnap.data().departments);
            const departmentsArray: string[] = departmentsSnap.data().departments;
  
            let staffPosition = "";
            if (staffData.dept?.startsWith("dept")) {
              staffPosition = staffData.dept.slice(0, staffData.dept.length - 3);
            } else {
              staffPosition = staffData.dept;
            }
  
            departmentsArray.map(async (department) => {
              const q = query(
                collection(db, `students/${currentYear}/${department}`),
                where(`${staffPosition}`, "!=", "UI")
              );
              const querySnapshot = await getDocs(q);
  
              console.log(`defaulters for ${department} are:`);
              const batch = writeBatch(db);
  
              querySnapshot.forEach((eachDoc) => {
                const studentRef = doc(
                  db,
                  `students/${currentYear}/${department}`,
                  `${eachDoc.data().matricNumber}`
                );
                batch.update(studentRef, { [staffPosition]: "approved" });
              });
  
              batch
                .commit()
                .then((response) => {
                  setIsApproveAllLoading(false);
                  console.log(response);
                  console.log("successfully approved all");
                  approveAllSuccess.current!.textContent =
                    "Successfully approved all";
                })
                .catch((error) => {
                  setIsApproveAllLoading(false);
                  console.log(error);
                  console.log("failed to approve all");
                  approveAllError.current!.textContent =
                    "Failed to approve all. Try again";
                });
            });
          } else {
            approveAllError.current!.textContent =
              "No department has been set for the current year";
          }
        } else {
          setIsApproveAllLoading(false);
          approveAllError.current!.textContent =
            "The current year has not been set. Please contact the admin.";
        }
      } catch (error) {
        setIsApproveAllLoading(false);
        console.log(error);
        approveAllError.current!.textContent = "There was an error. Try again";
      }
    }

  }

  //function handler for the approve one form
  async function approveOne(e: FormEvent) {
    e.preventDefault();

    //if the given matric number is invalid
    if (!/^([a-z]{3})(\/\d{2})(\/\d{4})$/.test(singleApprovalMatricNumber)) {
      approveOneError.current!.textContent = "Invalid matric number"; //display an error message
    } else {
      //otherwise

      //if the current staff is a departmental staff
      if (staffData.dept?.startsWith("dept")) {
        const dept = staffData.dept.slice(
          staffData.dept.length - 3,
          staffData.dept.length
        );

        //check that the matric number belongs to the department of that staff
        if (!singleApprovalMatricNumber.startsWith(dept)) {
          //if it does not belong to that department
          approveOneError.current!.textContent =
            "You can only approve students of your department."; //display an error message
        } else {
          //otherwise

          setIsApproveOneLoading(true); //display a loading spinner

          try{
            const staffPosition = staffData.dept.slice(
              0,
              staffData.dept.length - 3
            );
            const matricSplit = singleApprovalMatricNumber.split("/");
            let studentRef = doc(
              db,
              `students/${2000 + Number(matricSplit[1]) + 5}/${matricSplit[0]}`,
              `${matricSplit.join("-")}`
            );
            let studentSnap = await getDoc(studentRef);
  
            if (studentSnap.exists()) {
              updateDoc(studentRef, { [staffPosition]: "approved" })
                .then((response) => {
                  console.log(response);
                  console.log("students data successfully updated");
                  setIsApproveOneLoading(false); //hide the loading spinner
  
                  approveOneSuccess.current!.textContent =
                    "Student successfully approved"; //display a success message
  
                  //hide the success message after the specified time
                  setTimeout(() => {
                    approveOneSuccess.current!.textContent = "";
                  }, 2000);
                })
                .catch((error) => {
                  console.log(error);
                  console.log("there was an error updating the students data");
                  setIsApproveOneLoading(false); //hide the loading spinner
                  approveOneError.current!.textContent =
                    "There was an error. Try again";
                });
            } else {
              studentRef = doc(
                db,
                `students/${2000 + Number(matricSplit[1]) + 4}/${matricSplit[0]}`,
                `${matricSplit.join("-")}`
              );
              studentSnap = await getDoc(studentRef);
  
              if (studentSnap.exists()) {
                updateDoc(studentRef, { [staffPosition]: "approved" })
                  .then((response) => {
                    console.log(response);
                    console.log("students data successfully updated");
                    setIsApproveOneLoading(false); //hide the loading spinner
  
                    approveOneSuccess.current!.textContent =
                      "Student successfully approved"; //display a success message
  
                    //hide the success message after the specified time
                    setTimeout(() => {
                      approveOneSuccess.current!.textContent = "";
                    }, 2000);
                  })
                  .catch((error) => {
                    console.log(error);
                    console.log("there was an error updating the students data");
                    setIsApproveOneLoading(false); //hide the loading spinner
                    approveOneError.current!.textContent =
                      "There was an error. Try again";
                  });
              } else {
                studentRef = doc(
                  db,
                  `students/${2000 + Number(matricSplit[1]) + 3}/${
                    matricSplit[0]
                  }`,
                  `${matricSplit.join("-")}`
                );
                studentSnap = await getDoc(studentRef);
  
                if (studentSnap.exists()) {
                  updateDoc(studentRef, { [staffPosition]: "approved" })
                    .then((response) => {
                      console.log(response);
                      console.log("students data successfully updated");
                      setIsApproveOneLoading(false); //hide the loading spinner
  
                      approveOneSuccess.current!.textContent =
                        "Student successfully approved"; //display a success message
  
                      //hide the success message after the specified time
                      setTimeout(() => {
                        approveOneSuccess.current!.textContent = "";
                      }, 2000);
                    })
                    .catch((error) => {
                      console.log(error);
                      console.log(
                        "there was an error updating the students data"
                      );
                      setIsApproveOneLoading(false); //hide the loading spinner
                      approveOneError.current!.textContent =
                        "There was an error. Try again";
                    });
                } else {
                  console.log("No such record found in the database");
                  setIsAddDefaulterLoading(false); //hide the loading spinner
                  addDefaulterError.current!.textContent =
                    "No such matric number was found"; //display an error message
                }
              }
            }
          }
          catch(error){
            console.log(error);
            setIsApproveOneLoading(false);
            approveOneError.current!.textContent = "There was an error. Try again";
          }

        }
      } else {
        //if the staff is not a departmental staff
        setIsApproveOneLoading(true); //display a loading spinner

        try{
          const staffPosition = staffData.dept;
          const matricSplit = singleApprovalMatricNumber.split("/");
          let studentRef = doc(
            db,
            `students/${2000 + Number(matricSplit[1]) + 5}/${matricSplit[0]}`,
            `${matricSplit.join("-")}`
          );
          let studentSnap = await getDoc(studentRef);
  
          if (studentSnap.exists()) {
            updateDoc(studentRef, { [staffPosition]: "approved" })
              .then((response) => {
                console.log(response);
                console.log("students data successfully updated");
                setIsApproveOneLoading(false); //hide the loading spinner
  
                approveOneSuccess.current!.textContent =
                  "Student successfully approved"; //display a success message
  
                //hide the success message after the specified time
                setTimeout(() => {
                  approveOneSuccess.current!.textContent = "";
                }, 2000);
              })
              .catch((error) => {
                console.log(error);
                console.log("there was an error updating the students data");
                setIsApproveOneLoading(false); //hide the loading spinner
                approveOneError.current!.textContent =
                  "There was an error. Try again";
              });
          } else {
            studentRef = doc(
              db,
              `students/${2000 + Number(matricSplit[1]) + 4}/${matricSplit[0]}`,
              `${matricSplit.join("-")}`
            );
            studentSnap = await getDoc(studentRef);
  
            if (studentSnap.exists()) {
              updateDoc(studentRef, { [staffPosition]: "approved" })
                .then((response) => {
                  console.log(response);
                  console.log("students data successfully updated");
                  setIsApproveOneLoading(false); //hide the loading spinner
  
                  approveOneSuccess.current!.textContent =
                    "Student successfully approved"; //display a success message
  
                  //hide the success message after the specified time
                  setTimeout(() => {
                    approveOneSuccess.current!.textContent = "";
                  }, 2000);
                })
                .catch((error) => {
                  console.log(error);
                  console.log("there was an error updating the students data");
                  setIsApproveOneLoading(false); //hide the loading spinner
                  approveOneError.current!.textContent =
                    "There was an error. Try again";
                });
            } else {
              studentRef = doc(
                db,
                `students/${2000 + Number(matricSplit[1]) + 3}/${matricSplit[0]}`,
                `${matricSplit.join("-")}`
              );
              studentSnap = await getDoc(studentRef);
  
              if (studentSnap.exists()) {
                updateDoc(studentRef, { [staffPosition]: "approved" })
                  .then((response) => {
                    console.log(response);
                    console.log("students data successfully updated");
                    setIsApproveOneLoading(false); //hide the loading spinner
  
                    approveOneSuccess.current!.textContent =
                      "Student successfully approved"; //display a success message
  
                    //hide the success message after the specified time
                    setTimeout(() => {
                      approveOneSuccess.current!.textContent = "";
                    }, 2000);
                  })
                  .catch((error) => {
                    console.log(error);
                    console.log("there was an error updating the students data");
                    setIsApproveOneLoading(false); //hide the loading spinner
                    approveOneError.current!.textContent =
                      "There was an error. Try again";
                  });
              } else {
                console.log("No such record found in the database");
                setIsApproveOneLoading(false); //hide the loading spinner
                approveOneError.current!.textContent =
                  "No such matric number was found";
              }
            }
          }
        }
        catch(error){
          console.log(error);
          setIsApproveOneLoading(false);
          approveOneError.current!.textContent = "There was an error. Try again";
        }

      }
    }
  }

  //input change handler for the approve one form
  function handleSingleApprovalChange(e: ChangeEvent<HTMLInputElement>) {
    setSingleApprovalMatricNumber(e.target.value);
  }

  let previousOpenDefaulter: React.Dispatch<
    React.SetStateAction<boolean>
  > | null = null;
  let previousOpenDefaulterId = -1;

  //function to close the other open Defaulter component when a new one is opened
  function openDefaulter(
    newOpenDefaulter: React.Dispatch<React.SetStateAction<boolean>>,
    id: number
  ) {
    if (previousOpenDefaulter !== null && previousOpenDefaulterId !== id) {
      previousOpenDefaulter(false);
    }
    previousOpenDefaulter = newOpenDefaulter;
    previousOpenDefaulterId = id;
  }

  function logOut() {
    signOut(auth)
      .then(() => {
        context?.setIsStaffLoggedIn(false);
      })
      .catch((error) => {
        console.log(error);
        alert("There was an error logging out. Try again");
      });
  }

  return (
    <div>
      <h2 className="staff-heading">
        Clearance for{" "}
        {(() => {
          if (staffData.dept?.startsWith("dept")) {
            let fullTitle = staffData.dept.slice(
              staffData.dept.length - 3,
              staffData.dept.length
            );

            switch (staffData.dept.slice(0, staffData.dept.length - 3)) {
              case "deptHod":
                fullTitle += " HOD";
                break;
              case "deptOfficer":
                fullTitle += " Departmental Officer";
                break;
              case "deptLab":
                fullTitle += " Lab Department";
                break;
              default:
                fullTitle += " [Loading]";
            }

            return fullTitle;
          } else {
            return staffData.dept;
          }
        })()}
      </h2>

      <section>
        <h2 className="defaulters-heading">Defaulters</h2>
        {staffData.defaulters.length === 0 && (
          <p className="no-defaulter">There are no defaulters</p>
        )}
        {staffData.defaulters.length !== 0 &&
          staffData.defaulters.map((value, index) => {
            return (
              <Defaulter
                key={index}
                props={value}
                updateState={setStaffData}
                openDefaulter={openDefaulter}
                staffData={staffData}
              />
            );
          })}
      </section>

      <section>
        <form
          onSubmit={addDefaulterSubmit}
          className="staff-form"
          ref={formRef}
        >
          <h2>Add Defaulter</h2>
          <label htmlFor="matricNumber">Matric Number</label>
          <input
            type="text"
            name="matricNumber"
            id="matricNumber"
            value={newDefaulterData.matricNumber}
            required
            onChange={addDefaulterInputChange}
            onInput={addDefaulterInputChange}
          />

          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            id="description"
            value={newDefaulterData.description}
            rows={6}
            required
            onChange={addDefaulterTextareaChange}
          ></textarea>

          <label htmlFor="date">Date</label>
          <input
            type="date"
            name="date"
            id="date"
            value={newDefaulterData.date}
            required
            onChange={addDefaulterInputChange}
          />
          <p ref={addDefaulterError} className="error-para"></p>
          <p ref={addDefaulterSuccess} className="success-para"></p>
          {isAddDefaulterLoading && <Spinner />}
          <button type="submit">Submit</button>
        </form>
      </section>

      <section className="approve-all">
        <p>
          The button below approves the clearance status for all students that
          have no issues with the department. Its action cannot be reversed.
        </p>

        <p ref={approveAllError} className="error-para"></p>
        <p ref={approveAllSuccess} className="success-para"></p>
        {isApproveAllLoading && <Spinner />}
        <button onClick={approveAll}>Approve All</button>
      </section>

      <section className="approve-one">
        <form onSubmit={approveOne} className="staff-form">
          <h2> Approve One Student</h2>
          <label htmlFor="matricNumber">Matric Number</label>
          <input
            type="text"
            name="matricNumber"
            id="matricNumber"
            onChange={handleSingleApprovalChange}
          />
          <p ref={approveOneError} className="error-para"></p>
          <p ref={approveOneSuccess} className="success-para"></p>
          {isApproveOneLoading && <Spinner />}
          <button type="submit">Submit</button>
        </form>
      </section>

      <section className="logout">
        <button onClick={logOut}>Log Out</button>
      </section>
    </div>
  );
}

export default Staff;
