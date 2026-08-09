/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Route, Routes } from "react-router-dom";

// import Navbar from "../../components/Navbar";
import LoginPage from "../../features/auth/login/LoginPage";
// @ts-expect-error
import AdminDashboard from "../../features/admin/AdminDashboard";
import PatientDashbaord from "../../features/patient/PatientDashboard";
import RegisterPage from "../../features/auth/register/RegisterPage";
import { ReceptionistDashboardPage } from "../../features/receptionist/ReceptionistDashboardPage";
import ProtectedRoute, { type UserRole } from "../../components/ProtectedRoute";
import { getRole } from "../../features/auth/services/authApi";
import Unauthorized from "../../features/extra/Unauthorized";
import DentistDashboardPage from "../../features/dentist/DentistDashboardPage";
import BillingDashboardPage from "../../features/billing/BillingDashboardPage";
import PatientBillingPage from "../../features/billing/PatientBillingPage";
import InventoryDashboardPage from "../../features/inventory/InventoryDashboardPage";
export default function AppRoutes() {
  const currentUserRole = getRole() as UserRole;

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/help" element="" />
        <Route path="/support" element="" />
        <Route path="/security" element="" />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" />

        <Route
          element={
            <ProtectedRoute
              userRole={currentUserRole}
              allowedRoles={["receptionist"]}
            />
          }
        >
          <Route
            path="/receptionist/dashboard"
            element={<ReceptionistDashboardPage />}
          />
        </Route>

        <Route
          element={
            <ProtectedRoute
              userRole={currentUserRole}
              allowedRoles={["admin"]}
            />
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              userRole={currentUserRole}
              allowedRoles={["admin", "dentist"]}
            />
          }
        >
          {/* Module 6 */}
          <Route path="/dentist/dashboard" element={<DentistDashboardPage />} />
        </Route>

            <Route
          element={
            <ProtectedRoute
              userRole={currentUserRole}
              allowedRoles={["patient", "admin"]}
            />
          }
        >
          <Route path="/patient/dashboard" element={<PatientDashbaord/>} />
          {/* Module 7: patient-facing invoices & payments */}
          <Route path="/patient/billing" element={<PatientBillingPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              userRole={currentUserRole}
              allowedRoles={["admin", "receptionist", "dentist"]}
            />
          }
        >
          {/* Module 7: front-desk invoicing & instalment ledger */}
          <Route path="/billing/dashboard" element={<BillingDashboardPage />} />
          {/* Module 8 */}
          <Route path="/inventory/dashboard" element={<InventoryDashboardPage />} />
        </Route>


      </Routes>
    </>
  );
}
