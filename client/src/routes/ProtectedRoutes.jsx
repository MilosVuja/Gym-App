import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoutes = ({allowedRoutes}) => {
  const {user} = useAuth();

  if(!user) return <Navigate to="/login" />;
  if(!allowedRoutes.includes(user.role)) return <Navigate to="/unauthorized" />;

  return <Outlet />;
};

export default ProtectedRoutes;