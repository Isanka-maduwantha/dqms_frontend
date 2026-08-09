import { type ReactElement } from 'react'
import { Navigate,Outlet } from "react-router-dom"; 
export type UserRole = "admin" | "dentist" | "receptionist" | "patient" | null;

interface ProtectedRouteProps {
  userRole: UserRole | null;
  allowedRoles: UserRole[];
}

function ProtectedRoute({ userRole, allowedRoles }: ProtectedRouteProps): ReactElement {
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  const isAuthorized = allowedRoles.includes(userRole);

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute