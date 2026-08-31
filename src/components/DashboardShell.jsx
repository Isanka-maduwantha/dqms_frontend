import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import logo from "../assets/span.brand-mark.png";

export default function DashboardShell({
  navItems,
  roleLabel,
  children,
  headerActions,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex grow w-full font-inter bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 min-h-screen text-slate-800">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-gradient-to-b from-[#041d14] via-[#06281e] to-[#03140e] text-white flex flex-col border-r border-emerald-900/40 shadow-2xl transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0E7A50] to-teal-400 p-0.5 shadow-md shadow-emerald-900/40 flex items-center justify-center">
              <div className="w-full h-full bg-white/95 rounded-[10px] flex items-center justify-center p-1 backdrop-blur-sm">
                <img src={logo} alt="" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-manrope font-extrabold text-[15px] tracking-tight">
                Dental<span className="text-teal-300">Surgery</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-300/80 uppercase tracking-wider">
                {roleLabel} Portal
              </span>
            </div>
          </div>
          <button
            type="button"
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col gap-1.5 px-3.5 py-6 grow overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/60">
            Navigation Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#0E7A50] to-emerald-600 text-white shadow-lg shadow-emerald-950/40 font-bold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span className="text-lg leading-none shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-emerald-900/30">
              {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-[12px]">
              <div className="font-bold text-white truncate">{user?.name || user?.email || "Staff User"}</div>
              <div className="text-emerald-300/70 text-[11px] truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{roleLabel}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2 text-[12px] font-semibold text-white/85 hover:bg-rose-600/20 hover:border-rose-500/40 hover:text-rose-200 transition-all duration-200 active:scale-95"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col grow min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 sm:px-8 py-3.5 backdrop-blur-xl bg-white/80 border-b border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="hidden sm:inline">Clinic Portal</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-[#0E7A50] font-bold">{roleLabel} Area</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {headerActions}
          </div>
        </header>

        {/* Main Body */}
        <main className="grow min-w-0 p-6 sm:p-8 lg:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
