import { Outlet } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";

const NAV_ITEMS = [
  { to: "/receptionist/dashboard", label: "Live Queue & Check-in", icon: "🎫", end: true },
  { to: "/receptionist/book", label: "Book Appointment", icon: "📅" },
  { to: "/receptionist/patients", label: "Patient Directory", icon: "👥" },
  { to: "/receptionist/billing", label: "Billing & Receipts", icon: "💳" },
];

export default function ReceptionistLayout() {
  return (
    <DashboardShell navItems={NAV_ITEMS} roleLabel="Receptionist">
      <Outlet />
    </DashboardShell>
  );
}
