import { NavLink } from "react-router-dom";
import logo from "../assets/span.brand-mark.png";
function Navbar() {
  return (
    <nav className="flex justify-between h-20 items-center pl-10 pr-10 font-inter">
      <div className="brand flex items-center">
        <NavLink to="/">
          <div className="container flex gap-2.5 items-center">
            <div className="icon-container">
              <img src={logo} alt="" />
            </div>
            <span className="font-manrope font-extrabold text-[16px] text-black">
              Dental Surgery
            </span>
          </div>
        </NavLink>
      </div>
      <ul className="nav-links flex items-center justify-evenly gap-7 text-[12px] text-muted-green">
        <li>
          <NavLink to="/"> Home </NavLink>
        </li>
        <li>
          <NavLink to="/#services">Services</NavLink>
        </li>
        <li>
          <NavLink to="/#about">About</NavLink>
        </li>
        <li>
          <NavLink to="/lobby">Live Queue</NavLink>
        </li>
      </ul>
      <div className="top-actions flex gap-2.5 font-inter items-center text-[12px] h-full">
        <NavLink to="/login" className="text-light">
          <button className=" bg-white border-border-grey border rounded-full p-1 pl-4 pr-4  text-black  ">
            Login
          </button>
        </NavLink>
        <NavLink to="/register" className="text-light">
          <button className=" bg-accent rounded-2xl pl-4 pr-4 p-1 text-white">
            Register
          </button>
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
