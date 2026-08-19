import { NavLink } from "react-router-dom";
import CommonButton from "../../components/CommanButton";

function Unauthorized() {
  return (
    <div className="grow flex flex-col items-center justify-center gap-4 text-center p-10">
      <span className="text-5xl">🚫</span>
      <h1 className="font-manrope text-2xl font-bold text-green-text-1">
        You don't have access to this page
      </h1>
      <p className="text-[13px] text-muted-green max-w-sm">
        Sign in with an account that has permission to view this portal.
      </p>
      <NavLink to="/login">
        <CommonButton label="Back to login" className="text-[13px] px-6 py-2.5" containerProps={{ className: "w-auto" }} />
      </NavLink>
    </div>
  );
}

export default Unauthorized;
