import { Outlet } from "react-router-dom";
import DashboardShell, { type NavItem } from "../../components/DashboardShell";

const NAV_ITEMS: NavItem[] = [
  { to: "/dentist/dashboard", label: "Queue", icon: "🔔", end: true },
  { to: "/dentist/patients", label: "Patients", icon: "🔍" },
  { to: "/dentist/inventory", label: "Inventory", icon: "📦" },
];

export default function DentistLayout() {
  return (
    <DashboardShell navItems={NAV_ITEMS} roleLabel="Dentist">
      <Outlet />
    </DashboardShell>
  );
}
