import { useState, useRef, FormEvent, ChangeEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import { AppContext } from "./AppProvider";
import PasswordInput from "./PasswordInput";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";

function AdminLogin() {
  const context = useContext(AppContext);
  const [adminLoginData, setadminLoginData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const loginError = useRef<HTMLParagraphElement | null>(null);

  const navigate = useNavigate();

  //function handler for staff login form
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true); //display the spinner
    loginError.current!.textContent = ""; //clear any error

    if (adminLoginData.email.toLowerCase() !== "tervenda18@gmail.com") {
      alert("error");
    } else {
      signInWithEmailAndPassword(
        auth,
        adminLoginData.email,
        adminLoginData.password
      )
        .then((adminCredential) => {
          console.log(adminCredential.user);
          context?.setIsAdminLoggedIn(true);
          navigate("/admin");
          console.log("successfully logged in");
        })
        .catch((error) => {
          setIsLoading(false);

          console.log(error);
          setIsLoading(false); //hide loading spinner
          loginError.current!.textContent = "There was an error. Try again"; //display error message
        });
    }
  };

  //function handler for input element
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    loginError.current!.textContent = ""; //clear any error
    setadminLoginData({ ...adminLoginData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="staff-form center-form">
        <h2> Admin Login</h2>

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

export default AdminLogin;
