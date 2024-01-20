import { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import Admin from "./Admin";
import StudentLogin from "./StudentLogin";
import DisplayStudent from "./DisplayStudent";
import StaffLogin from "./StaffLogin";
import Staff from "./Staff";
import AdminLogin from "./AdminLogin";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AppContext } from "./AppProvider";
import { Navigate } from "react-router-dom";


function Router() {
    const context = useContext(AppContext);
    console.log("current admin login is:");
    console.log(context?.isAdminLoggedIn)
  return (
    <div className="router-cont">
      <Navbar />
      <Routes>
        <Route path="/" element={<StudentLogin />} />
        <Route path="/admin" element={context?.isAdminLoggedIn ? <Admin /> : <Navigate to={"/admin-login"} />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/student/:matricNumber" element={<DisplayStudent />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/staff" element={context?.isStaffLoggedIn ? <Staff /> : <Navigate to={"/staff-login"} />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default Router;
