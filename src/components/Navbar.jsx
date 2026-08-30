import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/span.brand-mark.png";
import { useAuth } from "../features/auth/AuthContext";

const ROLE_HOME = {
  patient: "/patient/dashboard",
  receptionist: "/receptionist/dashboard",
  dentist: "/dentist/dashboard",
  admin: "/admin/dashboard",
};

function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboardPath = user?.role ? ROLE_HOME[user.role] || "/" : "/";

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/75 border-b border-blue-100/60 shadow-[0_4px_25px_-5px_rgba(37,99,235,0.06)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
              <div className="w-full h-full bg-white/95 rounded-[10px] flex items-center justify-center p-1.5 backdrop-blur-sm">
                <img src={logo} alt="Dental Surgery" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-manrope font-extrabold text-[17px] text-slate-900 tracking-tight flex items-center gap-1.5">
                Dental<span className="text-blue-600 font-extrabold">Surgery</span>
                <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase -mt-0.5">
                Clinical Portal
              </span>
            </div>
          </NavLink>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60 backdrop-blur-md">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm font-bold"
                  : "text-slate-600 hover:text-blue-600 hover:bg-white/50"
              }`
            }
          >
            Home
          </NavLink>
          <a
            href="/#services"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white/50 transition-all duration-200"
          >
            Services
          </a>
          <a
            href="/#about"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white/50 transition-all duration-200"
          >
            About Practice
          </a>
                    <NavLink
            to="/lobby"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm font-bold"
                  : "text-slate-600 hover:text-blue-600 hover:bg-white/50"
              }`
            }
          >
           Lobby
          </NavLink>
          <NavLink
            to="/patient/book-appointment"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm font-bold"
                  : "text-slate-600 hover:text-blue-600 hover:bg-white/50"
              }`
            }
          >
            Book Slot
          </NavLink>
        </nav>

        {/* Top Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <NavLink
                to={dashboardPath}
                className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>👤</span>
                <span>{user.name || user.email?.split("@")[0] || "Dashboard"}</span>
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:text-rose-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/login">
                <button className="px-4 py-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 text-slate-700 text-xs font-bold hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow active:scale-95">
                  Sign In
                </button>
              </NavLink>
              <NavLink to="/register">
                <button className="px-4 py-2 rounded-xl glossy-gradient-btn text-white text-xs font-bold shadow-md shadow-blue-600/25 active:scale-95 flex items-center gap-1.5">
                  <span>Register</span>
                  <span>→</span>
                </button>
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
          >
            Home
          </NavLink>
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
          >
            Services
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
          >
            About Practice
          </a>
          <NavLink
            to="/patient/book-appointment"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
          >
            Book Appointment
          </NavLink>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <NavLink
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs"
                >
                  My Portal
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <NavLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs">
                    Sign In
                  </button>
                </NavLink>
                <NavLink to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2.5 rounded-xl glossy-gradient-btn text-white font-bold text-xs">
                    Register
                  </button>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
