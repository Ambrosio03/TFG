import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar";

const CustomLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Outlet />
    </div>
  );
};

export default CustomLayout;
