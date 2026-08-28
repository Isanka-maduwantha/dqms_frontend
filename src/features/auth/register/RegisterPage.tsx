import { NavLink } from "react-router-dom";
import RegisterFrom from "./RegisterFrom";
function RegisterPage() {


  return (
    <div className="grid grid-cols-10 h-full grow ">
      <div className="hero-panel col-span-4 bg-accent h-full"></div>
      <div className="form-panel col-span-6 pl-16 pr-16 pt-14 pb-14">
        <div className="header-text">
          <h1 className="text-2xl font-bold text-green-text-1 text-left">
            Create your patient account
          </h1>
          <p className="text-left text-muted-green">
            Provide your identification details to register.
          </p>
        </div>

        <RegisterFrom/>
        <p className="text-[14px] pt-4">
          Already have an account?{" "}
          <NavLink to="/login">
            <span className="text-accent font-bold">Sign in</span>
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
