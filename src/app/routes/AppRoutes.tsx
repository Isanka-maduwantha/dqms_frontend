import { Route, Routes } from "react-router-dom";

import Navbar from "../../components/Navbar";
import LoginPage from "../../features/auth/login/LoginPage";
import RegisterPage from "../../features/auth/register/RegisterPage";
import { ReceptionistDashboardPage } from "../../features/receptionist/ReceptionistDashboardPage";

export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/receptionist" element={<ReceptionistDashboardPage />} />
        <Route path="/help" element="" />
        <Route path="/support" element="" />
        <Route path="/security" element="" />

        <Route path="/" />
      </Routes>
    </>
  );
}
