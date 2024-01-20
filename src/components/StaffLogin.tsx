import { useState, FormEvent, ChangeEvent, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import PasswordInput from "./PasswordInput";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";
import { AppContext } from "./AppProvider";

function StaffLogin() {
  const [staffLoginData, setStaffLoginData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const loginError = useRef<HTMLParagraphElement | null>(null);

  const navigate = useNavigate();
  const context = useContext(AppContext);

  //function handler for staff login form
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true); //display the spinner
    loginError.current!.textContent = ""; //clear any error

      signInWithEmailAndPassword(auth, staffLoginData.email, staffLoginData.password).then((staffCredential) => {
        console.log(staffCredential.user.uid);
        context?.setIsStaffLoggedIn(true);
        context?.setCurrentStaffUID(staffCredential.user.uid);
        setIsLoading(false);
        navigate("/staff");
      }).catch((error) => {
        console.log(error);
        setIsLoading(false); //hide loading spinner
        loginError.current!.textContent = "There was an error. Try again";
      })
  };

  //function handler for input element
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    loginError.current!.textContent = ""; //clear any error
    setStaffLoginData({ ...staffLoginData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="staff-form center-form">
        <h2> Staff Login</h2>

        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <PasswordInput change={handleChange} />

        <p ref={loginError} className="error-para"></p>
        {isLoading && <Spinner />}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default StaffLogin;
