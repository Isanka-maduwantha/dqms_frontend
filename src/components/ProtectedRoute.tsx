import { type ReactElement } from 'react'
import { Navigate,Outlet } from "react-router-dom"; 
export type UserRole = "admin" | "dentist" | "receptionist" | "patient" | null;

interface ProtectedRouteProps {
    userRole: UserRole;
    allowedRoles: UserRole[];
}

function ProtectedRoute({userRole, allowedRoles} : ProtectedRouteProps) : ReactElement {
    const isAuthorized = userRole ? allowedRoles.includes(userRole) : false;

    if(!isAuthorized) {
        return <Navigate to="/unauthorized" replace />
    }
  return (
    <Outlet/>
  )
}

export default ProtectedRoute