import { NavLink } from "react-router-dom";
import RegisterFrom from "./RegisterFrom";

function RegisterPage() {
  return (
    <div className="grow min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-12 rounded-3xl overflow-hidden glass-card border border-white/80 shadow-2xl">
        {/* Left Hero Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-800 via-[#0E7A50] to-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner">
              ✨
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block">
              Patient Registration
            </span>
            <h2 className="font-manrope text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Join our modern clinical network.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Create your secure patient profile to book instant appointments, skip lobby queues, and track your dental records.
            </p>
          </div>

          <div className="relative z-10 space-y-3 pt-8 border-t border-white/15 text-xs text-emerald-100">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-400/20 text-teal-300 flex items-center justify-center font-bold">1</span>
              <span>15-minute slot calendar booking</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-400/20 text-teal-300 flex items-center justify-center font-bold">2</span>
              <span>Real-time lobby queue position</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-400/20 text-teal-300 flex items-center justify-center font-bold">3</span>
              <span>Digital diagnosis & invoice history</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white/75 backdrop-blur-xl">
          <div className="mb-6 text-left">
            <span className="text-xs font-bold text-[#0E7A50] uppercase tracking-wider">
              Create Account
            </span>
            <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Patient Registration
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Please enter your identification details to register.
            </p>
          </div>

          <RegisterFrom />

          <div className="pt-6 mt-6 border-t border-slate-100 text-xs text-slate-600 text-center">
            <span>Already have an account? </span>
            <NavLink to="/login" className="text-[#0E7A50] font-bold hover:underline">
              Sign in here →
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
