import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export default function RequireAuth({ allowedRoles, children }) {
  const { member, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!member) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(member.role)) return <Navigate to="/no-access" replace />;

  return children ? children : <Outlet />;
}
