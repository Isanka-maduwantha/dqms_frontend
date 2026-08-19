import { Outlet } from "react-router-dom";
import DashboardShell, { type NavItem } from "../../components/DashboardShell";

const NAV_ITEMS: NavItem[] = [
  { to: "/receptionist/dashboard", label: "Queue & Check-in", icon: "🪑", end: true },
  { to: "/receptionist/book", label: "Book Appointment", icon: "📅" },
  { to: "/receptionist/patients", label: "Patients", icon: "🧑‍🤝‍🧑" },
  { to: "/receptionist/billing", label: "Billing", icon: "💳" },
];

export default function ReceptionistLayout() {
  return (
    <DashboardShell navItems={NAV_ITEMS} roleLabel="Receptionist">
      <Outlet />
    </DashboardShell>
  );
}
