import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../../app/context/AuthContext";

export default function RequireAdmin({ children }) {
  const { member } = useContext(AuthContext);

  if (!member || member.role !== "admin") {

    return <Navigate to="/no-access" replace />;
  }

  return children;
}
