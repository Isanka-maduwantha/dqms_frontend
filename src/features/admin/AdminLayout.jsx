import { Outlet } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Alerts & Notifications", icon: "🔔", end: true },
  { to: "/admin/inventory", label: "Inventory Management", icon: "📦" },
  { to: "/admin/reports", label: "Operational Reports", icon: "📊" },
];

export default function AdminLayout() {
  return (
    <DashboardShell navItems={NAV_ITEMS} roleLabel="Administrator">
      <Outlet />
    </DashboardShell>
  );
}
