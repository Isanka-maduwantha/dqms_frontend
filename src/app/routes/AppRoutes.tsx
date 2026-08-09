/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Route, Routes } from "react-router-dom";

// import Navbar from "../../components/Navbar";

import LoginPage from "../../features/auth/login/LoginPage";

// @ts-expect-error
import AdminDashboard from "../../features/admin/AdminDashboard";

import PatientDashbaord from "../../features/patient/PatientDashboard";

import RegisterPage from "../../features/auth/register/RegisterPage";

import { ReceptionistDashboardPage } from "../../features/receptionist/pages/ReceptionistDashboardPage";

import ProtectedRoute, { type UserRole } from "../../components/ProtectedRoute";

import { getRole } from "../../features/auth/services/authApi";

import Unauthorized from "../../features/extra/Unauthorized";
import FindSlots from "../../features/patient/FindSlots";
import MainPage from "../../features/extra/MainPage";
export default function AppRoutes() {
  const currentUserRole: UserRole | null = getRole() as UserRole | null;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/help" element="" />
      <Route path="/support" element="" />
      <Route path="/security" element="" />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<MainPage />} />

      <Route
        path="/receptionist/dashboard"
        element={<ReceptionistDashboardPage />}
      />

      <Route
        element={
          <ProtectedRoute 
          userRole={currentUserRole} 
          allowedRoles={["admin"]} />
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route
        element={
          <ProtectedRoute
            userRole={currentUserRole}
            allowedRoles={["dentist", "admin"]}
          />
        }
      >
        <Route path="/dentist/dashboard" element="" />
      </Route>

      <Route
        element={
          <ProtectedRoute
            userRole={currentUserRole}
            allowedRoles={["patient", "admin"]}
          />
        }
      >
        <Route path="/patient/dashboard" element={<PatientDashbaord />} />
        <Route path="/patient/book-appointment" element={<FindSlots />} />
      </Route>
    </Routes>
  );
}
