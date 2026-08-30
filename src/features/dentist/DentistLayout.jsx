import { Outlet } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";

const NAV_ITEMS = [
  { to: "/dentist/dashboard", label: "Consultation Queue", icon: "🔔", end: true },
  { to: "/dentist/patients", label: "Patient Dental Charts", icon: "🔍" },
  { to: "/dentist/inventory", label: "Consumables Inventory", icon: "📦" },
];

export default function DentistLayout() {
  return (
    <DashboardShell navItems={NAV_ITEMS} roleLabel="Dentist">
      <Outlet />
    </DashboardShell>
  );
}
