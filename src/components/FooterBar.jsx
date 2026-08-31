import { NavLink } from "react-router-dom";

function FooterBar() {
  return (
    <footer className="w-full font-inter backdrop-blur-xl bg-white/80 border-t border-slate-200/80 py-5 px-6 sm:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Queue Engine v2.4</span>
          </div>
          <span className="text-slate-400">•</span>
          <span className="font-medium">© {new Date().getFullYear()} Dental Surgery Clinic. All rights reserved.</span>
        </div>

        <ul className="flex items-center gap-6 font-medium">
          <li>
            <NavLink to="/help" className="hover:text-[#0E7A50] transition-colors">
              Help Center
            </NavLink>
          </li>
          <li>
            <NavLink to="/support" className="hover:text-[#0E7A50] transition-colors">
              Support Desk
            </NavLink>
          </li>
          <li>
            <NavLink to="/security" className="hover:text-[#0E7A50] transition-colors">
              HIPAA & Security
            </NavLink>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default FooterBar;
