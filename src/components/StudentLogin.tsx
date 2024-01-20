import { FormEvent, useState, ChangeEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";

function StudentLogin() {
  const [matricNumber, setMatricNumber] = useState("");
  const navigate = useNavigate();
  const matricNumberError = useRef<HTMLParagraphElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^([a-z]{3})(\/\d{2})(\/\d{4})$/.test(matricNumber)) {
      matricNumberError.current!.textContent = "Invalid matric number";
    } else {
      const route = matricNumber.split("/").join("-");
      navigate(`/student/${route}`);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMatricNumber(e.target.value.toLowerCase());
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="staff-form center-form">
        <h2>Enter Your Matric Number</h2>
        <input type="text" onChange={handleChange} className="lowercase" />
        <p className="error-para" ref={matricNumberError}></p>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default StudentLogin;
