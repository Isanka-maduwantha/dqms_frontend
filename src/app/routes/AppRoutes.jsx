import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "../../features/auth/login/LoginPage";
import AdminLoginPage from "../../features/auth/login/AdminLoginPage";
import RegisterPage from "../../features/auth/register/RegisterPage";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../features/auth/AuthContext";
import Unauthorized from "../../features/extra/Unauthorized";
import MainPage from "../../features/extra/MainPage";
import HelpSupportPage from "../../features/extra/HelpSupportPage";
import PatientDashboard from "../../features/patient/PatientDashboard";
import FindSlots from "../../features/patient/FindSlots";
import ReceptionistLayout from "../../features/receptionist/ReceptionistLayout";
import QueuePage from "../../features/receptionist/pages/QueuePage";
import PatientsPage from "../../features/receptionist/pages/PatientsPage";
import BookAppointmentPage from "../../features/receptionist/pages/BookAppointmentPage";
import BillingPage from "../../features/receptionist/pages/BillingPage";
import DentistLayout from "../../features/dentist/DentistLayout";
import DentistQueuePage from "../../features/dentist/pages/DentistQueuePage";
import DentistPatientSearchPage from "../../features/dentist/pages/DentistPatientSearchPage";
import DentistPatientDetailPage from "../../features/dentist/pages/DentistPatientDetailPage";
import DentistInventoryPage from "../../features/dentist/pages/DentistInventoryPage";
import AdminLayout from "../../features/admin/AdminLayout";
import AdminDashboardPage from "../../features/admin/pages/AdminDashboardPage";
import AdminInventoryPage from "../../features/admin/pages/AdminInventoryPage";
import AdminReportsPage from "../../features/admin/pages/AdminReportsPage";
import Lobby from "../../features/extra/Lobby";

export default function AppRoutes() {
  const { role } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/lobby" element={<Lobby />}/>
      <Route path="/help" element={<HelpSupportPage type="help" />} />
      <Route path="/support" element={<HelpSupportPage type="support" />} />
      <Route path="/security" element={<HelpSupportPage type="security" />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<MainPage />} />

      {/* Patient Portal */}
      <Route element={<ProtectedRoute userRole={role} allowedRoles={["patient"]} />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/book-appointment" element={<FindSlots />} />
      </Route>

      {/* Receptionist Portal */}
      <Route
        element={
          <ProtectedRoute userRole={role} allowedRoles={["receptionist", "admin"]} />
        }
      >
        <Route path="/receptionist" element={<ReceptionistLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<QueuePage />} />
          <Route path="book" element={<BookAppointmentPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="billing" element={<BillingPage />} />
        </Route>
      </Route>

      {/* Dentist Portal */}
      <Route
        element={<ProtectedRoute userRole={role} allowedRoles={["dentist", "admin"]} />}
      >
        <Route path="/dentist" element={<DentistLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DentistQueuePage />} />
          <Route path="patients" element={<DentistPatientSearchPage />} />
          <Route path="patients/:patientId" element={<DentistPatientDetailPage />} />
          <Route path="inventory" element={<DentistInventoryPage />} />
        </Route>
      </Route>

      {/* Admin Portal */}
      <Route element={<ProtectedRoute userRole={role} allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
