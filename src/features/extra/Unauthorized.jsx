import { NavLink } from "react-router-dom";
import CommonButton from "../../components/CommanButton";

function Unauthorized() {
  return (
    <div className="grow flex flex-col items-center justify-center gap-5 text-center p-8 sm:p-14 min-h-[70vh]">
      <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-200/80 flex items-center justify-center text-4xl shadow-lg shadow-emerald-700/10">
        🛡️
      </div>
      <div className="max-w-md space-y-2">
        <span className="inline-block px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 font-bold text-[11px] uppercase tracking-wider border border-rose-200">
          Access Restricted
        </span>
        <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-800">
          You don't have permission
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          The requested clinical section requires higher role clearance or a different account type.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-3">
        <NavLink to="/login">
          <CommonButton
            label="Sign in with another account"
            className="px-6 py-2.5 text-xs sm:text-sm"
            containerProps={{ className: "w-auto" }}
          />
        </NavLink>
        <NavLink to="/">
          <button className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-sm">
            Back to Home
          </button>
        </NavLink>
      </div>
    </div>
  );
}

export default Unauthorized;
