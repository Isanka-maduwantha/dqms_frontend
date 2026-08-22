import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

interface DashboardShellProps {
  navItems: NavItem[];
  roleLabel: string;
  children: ReactNode;
  headerActions?: ReactNode;
}

export default function DashboardShell({
  navItems,
  roleLabel,
  children,
  headerActions,
}: DashboardShellProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex grow w-full font-inter bg-[#F7FAF8] min-h-0">
      <aside className="w-60 shrink-0 bg-cyan-green text-white flex flex-col">
        <div className="flex items-center gap-2.5 px-6 py-6 border-b border-white/10">
          <span className="text-2xl">🦷</span>
          <span className="font-manrope font-extrabold text-[15px]">
            Dental Surgery
          </span>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-5 grow">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                  isActive
                    ? "bg-accent text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-white/10 space-y-3">
          <div className="text-[12px]">
            <div className="font-bold truncate">{user?.name || user?.email || "User"}</div>
            <div className="text-white/60 truncate">{roleLabel}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-[10px] border border-white/20 py-2 text-[12px] font-semibold text-white/90 hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex flex-col grow min-w-0">
        {headerActions && (
          <div className="flex justify-end items-center gap-3 px-8 py-4 border-b border-border-grey bg-white">
            {headerActions}
          </div>
        )}
        <main className="grow min-w-0 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
