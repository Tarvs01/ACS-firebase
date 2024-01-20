import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "./Modal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { StudentDetails } from "./types";
import { ClockLoader } from "react-spinners";

function DisplayStudent() {
  const matricNumber = useParams();
  const [studentData, setStudentData] = useState({
    matricNumber: "",
    library: "",
    crc: "",
    deptLab: "",
    deptOfficer: "",
    deptHod: "",
  });
  const [displayModal, setDisplayModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      const matricSplit = matricNumber.matricNumber!.split("-");

      let studentRef = doc(
        db,
        `students/${2000 + Number(matricSplit[1]) + 5}/${matricSplit[0]}`,
        `${matricSplit.join("-")}`
      );
      let studentSnap = await getDoc(studentRef);

      if (studentSnap.exists()) {
        const data: StudentDetails = studentSnap.data() as StudentDetails;
        setStudentData(data);
        setIsLoading(false);
      } else {
        studentRef = doc(
          db,
          `students/${2000 + Number(matricSplit[1]) + 4}/${matricSplit[0]}`,
          `${matricSplit.join("-")}`
        );
        studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
          const data: StudentDetails = studentSnap.data() as StudentDetails;
          setStudentData(data);
          setIsLoading(false);
        } else {
          studentRef = doc(
            db,
            `students/${2000 + Number(matricSplit[1]) + 3}/${matricSplit[0]}`,
            `${matricSplit.join("-")}`
          );
          studentSnap = await getDoc(studentRef);

          if (studentSnap.exists()) {
            const data: StudentDetails = studentSnap.data() as StudentDetails;
            setStudentData(data);
            setIsLoading(false);
          } else {
            setModalMessage(
              `No details found for ${matricNumber.matricNumber
                ?.split("-")
                .join("/")}`
            );
            setDisplayModal(true);
          }
        }
      }
    }

    getData();
  }, [matricNumber]);

  return (
    <div>
      {displayModal && <Modal message={modalMessage} redirect={"/"} />}
      {!displayModal && (
        <>
          {isLoading && (
            <>
              <ClockLoader
                color="blue"
                cssOverride={{ margin: "100px auto 20px" }}
                size={80}
              />
              <p className="loading">Loading</p>
            </>
          )}
          {!isLoading && (
            <>
              <h2 className="student-header">
                Clearance Details for{" "}
                {matricNumber.matricNumber?.split("-").join("/").toUpperCase()}
              </h2>
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Department Lab</td>
                    <td className={studentData.deptLab}>
                      {studentData.deptLab}
                    </td>
                  </tr>
                  <tr>
                    <td>Department Officer</td>
                    <td className={studentData.deptOfficer}>
                      {studentData.deptOfficer}
                    </td>
                  </tr>
                  <tr>
                    <td>Department HOD</td>
                    <td className={studentData.deptHod}>
                      {studentData.deptHod}
                    </td>
                  </tr>
                  <tr>
                    <td>Library</td>
                    <td className={studentData.library}>
                      {studentData.library}
                    </td>
                  </tr>
                  <tr>
                    <td>CRC</td>
                    <td className={studentData.crc}>{studentData.crc}</td>
                  </tr>
                </tbody>
              </table>

              <ul className="legend">
                <li>
                  <h3 className="default">Default</h3>: There are no issues with
                  the department and the department has not approved your
                  clearance
                </li>
                <li>
                  <h3 className="UI">Unrectified Issues</h3>: You have unsettled
                  issue(s) with the department
                </li>
                <li>
                  <h3 className="approved">Approved</h3>: The department has
                  approved your clearance
                </li>
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default DisplayStudent;
