/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

// import Navbar from "../../components/Navbar";

import LoginPage from "../../features/auth/login/LoginPage";

// @ts-expect-error
import AdminDashboard from "../../features/admin/AdminDashboard";

import PatientDashbaord from "../../features/patient/PatientDashboard";

import RegisterPage from "../../features/auth/register/RegisterPage";

import {
  ReceptionistDashboardPage,
} from "../../features/receptionist/pages/ReceptionistDashboardPage";

import ProtectedRoute, {
  type UserRole,
} from "../../components/ProtectedRoute";

import {
  getRole,
} from "../../features/auth/services/authApi";

import Unauthorized from "../../features/extra/Unauthorized";


export default function AppRoutes() {

  const currentUserRole: UserRole =
    getRole();

  return (
    <Routes>

      {/* =====================================================
          LOGIN
      ===================================================== */}

      <Route
        path="/login"
        element={<LoginPage />}
      />


      {/* =====================================================
          REGISTER
      ===================================================== */}

      <Route
        path="/register"
        element={<RegisterPage />}
      />


      {/* =====================================================
          UNAUTHORIZED
      ===================================================== */}

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />


      {/* =====================================================
          ROOT
          
          FIXES:
          "Matched leaf route at location "/" does not have
          an element or Component."
      ===================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* =====================================================
          RECEPTIONIST
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            userRole={currentUserRole}
            allowedRoles={[
              "receptionist",
            ]}
          />
        }
      >

        <Route
          path="/receptionist/dashboard"
          element={
            <ReceptionistDashboardPage />
          }
        />

      </Route>


      {/* =====================================================
          ADMIN
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            userRole={currentUserRole}
            allowedRoles={[
              "admin",
            ]}
          />
        }
      >

        <Route
          path="/admin/dashboard"
          element={
            <AdminDashboard />
          }
        />

      </Route>


      {/* =====================================================
          DENTIST
          
          No dashboard component is currently being added here.
          Therefore this route is intentionally not included.
      ===================================================== */}


      {/* =====================================================
          PATIENT
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            userRole={currentUserRole}
            allowedRoles={[
              "patient",
              "admin",
            ]}
          />
        }
      >

        <Route
          path="/patient/dashboard"
          element={
            <PatientDashbaord />
          }
        />

      </Route>


      {/* =====================================================
          UNKNOWN URL
          
          Send unknown pages to login.
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}