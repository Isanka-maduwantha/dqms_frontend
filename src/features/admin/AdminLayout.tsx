import { Outlet } from "react-router-dom";
import DashboardShell, { type NavItem } from "../../components/DashboardShell";

const NAV_ITEMS: NavItem[] = [
  { to: "/admin/dashboard", label: "Notifications", icon: "🔔", end: true },
  { to: "/admin/inventory", label: "Inventory", icon: "📦" },
  { to: "/admin/reports", label: "Reports", icon: "📊" },
];

export default function AdminLayout() {
  return (
    <DashboardShell navItems={NAV_ITEMS} roleLabel="Administrator">
      <Outlet />
    </DashboardShell>
  );
}
