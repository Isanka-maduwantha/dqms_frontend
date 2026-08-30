import { Navigate, Outlet } from "react-router-dom";
function ProtectedRoute({ userRole, allowedRoles }) {
    const isAuthorized = userRole ? allowedRoles.includes(userRole) : false;
    if (!isAuthorized) {
        return <Navigate to="/unauthorized" replace/>;
    }
    return (<Outlet />);
}
export default ProtectedRoute;
