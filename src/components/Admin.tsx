import { useState, FormEvent, ChangeEvent, useRef } from "react";
import Spinner from "./Spinner";
import PasswordInput from "./PasswordInput";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import {
  setDoc,
  doc,
  getDoc,
  writeBatch,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

function Admin() {
  const [staffToRegister, setStaffToRegister] = useState({
    email: "",
    password: "",
    dept: "",
  });

  const [studentsToRegister, setStudentsToRegister] = useState({
    graduatingYear: "",
    entryYear: "",
    dept: "",
    start: "",
    end: "",
  });

  const [studentDatabaseYear, setStudentDatabaseYear] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);

  const [isRegisterStaffLoading, setIsRegisterStaffLoading] = useState(false);
  const [isRegisterStudentsLoading, setIsRegisterStudentsLoading] =
    useState(false);
  const [isCreateDBLoading, setIsCreateDBLoading] = useState(false);
  const [isSetYearLoading, setIsSetYearLoading] = useState(false);

  const registerStaffSuccess = useRef<HTMLParagraphElement | null>(null);
  const registerStaffError = useRef<HTMLParagraphElement | null>(null);
  const registerStudentsSuccess = useRef<HTMLParagraphElement | null>(null);
  const registerStudentsError = useRef<HTMLParagraphElement | null>(null);
  const createDBSuccess = useRef<HTMLParagraphElement | null>(null);
  const createDBerror = useRef<HTMLParagraphElement | null>(null);
  const setCurrentYearSuccess = useRef<HTMLParagraphElement | null>(null);
  const setCurrentYearError = useRef<HTMLParagraphElement | null>(null);
  const registerStaffForm = useRef<HTMLFormElement | null>(null);
  const registerStudentsForm = useRef<HTMLFormElement | null>(null);

  function handleDBChange(e: ChangeEvent<HTMLInputElement>) {
    setStudentDatabaseYear(Number(e.target.value));
  }

  async function handleDBSubmit(e: FormEvent) {
    e.preventDefault();
    createDBerror.current!.textContent = "";
    setIsCreateDBLoading(true);

    try{
      const docRef = doc(db, "students", String(studentDatabaseYear));
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        setIsCreateDBLoading(false);
        createDBerror.current!.textContent = "Database already exists";
      } else {
        setDoc(doc(db, "students", String(studentDatabaseYear)), {})
          .then((response) => {
            console.log(response);
            setIsCreateDBLoading(false);
            createDBSuccess.current!.textContent =
              "Database successfully created";
            setTimeout(() => {
              createDBSuccess.current!.textContent = "";
            }, 2000);
          })
          .catch((error) => {
            console.log(error);
            setIsCreateDBLoading(false);
            createDBerror.current!.textContent =
              "There was an error creating the database";
          });
      }
    }
    catch(error){
      console.log(error);
      setIsCreateDBLoading(false);
      createDBerror.current!.textContent =
              "There was an error creating the database";
    }

  }

  function handleStaffRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    setIsRegisterStaffLoading(true);

    registerStaffError.current!.textContent = "";

    if(staffToRegister.password.length < 6){
      registerStaffError.current!.textContent = "Password Length is too short";
      setIsRegisterStaffLoading(false);
    }
    else{

      createUserWithEmailAndPassword(
        auth,
        staffToRegister.email,
        staffToRegister.password
      )
        .then((staffCredential) => {
          console.log(staffCredential.user.uid);
  
          setDoc(doc(db, "staff", staffCredential.user.uid), {
            dept: staffToRegister.dept,
            defaulters: [],
          })
            .then((response) => {
              setIsRegisterStaffLoading(false);
              registerStaffSuccess.current!.textContent =
                "Staff successfully registered";
              registerStaffForm.current!.reset();
              setTimeout(() => {
                registerStaffSuccess.current!.textContent = "";
              }, 2000);
              console.log(response);
            })
            .catch((error) => {
              console.log(error);
              setIsRegisterStaffLoading(false);
              registerStaffError.current!.textContent = "There was an error creating the user";
            });
        })
        .catch((error) => {
          setIsRegisterStaffLoading(false);
  
          console.log(error);
        });
    }

  }

  function handleStaffRegistrationChange(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    setStaffToRegister({ ...staffToRegister, [e.target.name]: e.target.value });
  }

  async function handleStudentsRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    setIsRegisterStudentsLoading(true);
    registerStudentsError.current!.textContent = "";

    try{
      const docRef = doc(db, "students", studentsToRegister.graduatingYear);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const batch = writeBatch(db);
  
        for (
          let i = Number(studentsToRegister.start);
          i <= Number(studentsToRegister.end);
          i++
        ) {
          const matricNo = `${studentsToRegister.dept}-${
            Number(studentsToRegister.entryYear) % 100
          }-${i}`;
          const studentRef = doc(
            db,
            `students/${studentsToRegister.graduatingYear}/${studentsToRegister.dept}`,
            matricNo
          );
          batch.set(studentRef, {
            matricNumber: matricNo,
            library: "default",
            crc: "default",
            deptLab: "default",
            deptOfficer: "default",
            deptHod: "default",
          });
        }
  
        batch
          .commit()
          .then(async () => {
            const finalYearDeptsRef = doc(
              db,
              "schoolDetails",
              studentsToRegister.graduatingYear
            );
            const finalYearDeptsSnap = await getDoc(finalYearDeptsRef);
  
            if (finalYearDeptsSnap.exists()) {
              updateDoc(finalYearDeptsRef, {
                departments: arrayUnion(studentsToRegister.dept),
              })
                .then((response) => {
                  console.log(response);
  
                  setIsRegisterStudentsLoading(false);
                  console.log(response);
                  console.log("batch update successful");
  
                  registerStudentsSuccess.current!.textContent =
                    "Students successfully registered";
  
                  setStudentsToRegister({
                    graduatingYear: "",
                    entryYear: "",
                    dept: "",
                    start: "",
                    end: "",
                  });
  
                  setTimeout(() => {
                    registerStudentsSuccess.current!.textContent = "";
                  }, 2000);
                })
                .catch((error) => {
                  console.log(error);
                  console.log("error with updating departments");
                  setIsRegisterStudentsLoading(false);
                  registerStudentsError.current!.textContent =
                    "Students registered but departments not updated";
                });
            } else {
              setDoc(finalYearDeptsRef, {
                departments: [studentsToRegister.dept],
              }).then((response) => {
                console.log(response);
                setIsRegisterStudentsLoading(false);
                console.log(response);
                console.log("batch update successful");
  
                registerStudentsSuccess.current!.textContent =
                  "Students successfully registered";
  
                  setStudentsToRegister({
                    graduatingYear: "",
                    entryYear: "",
                    dept: "",
                    start: "",
                    end: "",
                  });
  
                setTimeout(() => {
                  registerStudentsSuccess.current!.textContent = "";
                }, 2000);
              }).catch((error) => {
                console.log(error);
                  console.log("error with updating departments");
                  setIsRegisterStudentsLoading(false);
                  registerStudentsError.current!.textContent =
                    "Students registered but departments not updated";
              })
            }
          })
          .catch((error) => {
            setIsRegisterStudentsLoading(false);
            console.log(error);
            console.log("Error with batch update");
            registerStudentsError.current!.textContent =
              "There was an error registering the students";
          });
      } else {
        console.log(
          `create the database for ${studentsToRegister.graduatingYear} first`
        );
        registerStudentsError.current!.textContent = `create the database for ${studentsToRegister.graduatingYear} first`;
      }
    }
    catch(error){
      console.log(error);
      setIsRegisterStudentsLoading(false);
      registerStudentsError.current!.textContent = `There was an error registering the students`;
    }

  }

  function handleStudentsRegisterChange(e: ChangeEvent<HTMLInputElement>) {
    setStudentsToRegister({
      ...studentsToRegister,
      [e.target.name]: e.target.value,
    });
  }

  function handleSetCurrentYearChange(e: ChangeEvent<HTMLInputElement>) {
    setCurrentYearError.current!.textContent = "";
    setCurrentYear(Number(e.target.value));
  }

  function handleSetCurrentYearSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSetYearLoading(true);

    setDoc(doc(db, "schoolDetails", "currentYear"), {
      year: currentYear,
    })
      .then((response) => {
        console.log(response);
        setIsSetYearLoading(false);

        setCurrentYearSuccess.current!.textContent =
          "Current year successfully added!";

        setTimeout(() => {
          setCurrentYearSuccess.current!.textContent = "";
        }, 2000);
      })
      .catch((error) => {
        console.log(error);
        setIsSetYearLoading(false);
        setCurrentYearError.current!.textContent =
          "There was an error. Try again.";
      });
  }
  return (
    <div>
      <section>
        <form
          onSubmit={handleStaffRegisterSubmit}
          className="staff-form"
          ref={registerStaffForm}
        >
          <h2>Register a Staff</h2>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            onInput={handleStaffRegistrationChange}
            required
          />

          <label htmlFor="password">Password</label>
          <PasswordInput change={handleStaffRegistrationChange} />
          {/* <input
              type="password"
              name="password"
              id="password"
              onInput={handleStaffRegistrationChange}
              required
            /> */}

          <label htmlFor="dept">Department</label>
          <input
            type="text"
            name="dept"
            id="dept"
            onInput={handleStaffRegistrationChange}
            required
          />

          <p ref={registerStaffError} className="error-para"></p>
          <p ref={registerStaffSuccess} className="success-para"></p>
          {isRegisterStaffLoading && <Spinner />}
          <button type="submit">Register</button>
        </form>

        <form
          onSubmit={handleStudentsRegisterSubmit}
          className="staff-form"
          ref={registerStudentsForm}
        >
          <h2>Register students</h2>

          <label htmlFor="year">Graduating Year</label>
          <input
            type="number"
            name="graduatingYear"
            id="year"
            value={studentsToRegister.graduatingYear}
            onInput={handleStudentsRegisterChange}
            required
            min={1960}
            max={9999}
          />

          <label htmlFor="entryYear">Entry Year</label>
          <input
            type="number"
            name="entryYear"
            id="entryYear"
            value={studentsToRegister.entryYear}
            onInput={handleStudentsRegisterChange}
            required
            min={1960}
            max={9999}
          />

          <label htmlFor="dept">Department</label>
          <input
            type="text"
            name="dept"
            id="department"
            value={studentsToRegister.dept}
            onInput={handleStudentsRegisterChange}
            required
          />

          <label htmlFor="start">Start Number</label>
          <input
            type="number"
            name="start"
            id="start"
            value={studentsToRegister.start}
            onInput={handleStudentsRegisterChange}
            required
          />

          <label htmlFor="end">End Number</label>
          <input
            type="number"
            name="end"
            id="end"
            value={studentsToRegister.end}
            onInput={handleStudentsRegisterChange}
            required
          />

          {/* <div className="extras-cont">
            <input
              type="checkbox"
              name="isExtraStudent"
              id="isExtraStudent"
              value={"hasExtra"}
              onChange={handleStudentsRegisterChange}
            />
            <label htmlFor="isExtraStudent">Extras?</label>
          </div> */}

          <p ref={registerStudentsSuccess} className="success-para"></p>
          <p ref={registerStudentsError} className="error-para"></p>
          {isRegisterStudentsLoading && <Spinner />}
          <button type="submit">Register</button>
        </form>

        <form onSubmit={handleDBSubmit} className="staff-form">
          <h2>Create Student DB</h2>
          <label htmlFor="year">Year</label>
          <input
            type="number"
            name="year"
            id="years"
            min={1960}
            max={9999}
            required
            onChange={handleDBChange}
          />
          <p ref={createDBSuccess} className="success-para"></p>
          <p ref={createDBerror} className="error-para"></p>
          {isCreateDBLoading && <Spinner />}
          <button type="submit">Create</button>
        </form>

        <form onSubmit={handleSetCurrentYearSubmit} className="staff-form">
          <h2>Set current year</h2>

          <label htmlFor="currentYear">Year</label>
          <input
            type="number"
            name="currentYear"
            id="currentYear"
            min={1960}
            max={9999}
            required
            onChange={handleSetCurrentYearChange}
          />
          {isSetYearLoading && <Spinner />}
          <p ref={setCurrentYearSuccess} className="success-para"></p>
          <p ref={setCurrentYearError} className="error-para"></p>
          <button type="submit">Set</button>
        </form>
      </section>
    </div>
  );
}

export default Admin;
