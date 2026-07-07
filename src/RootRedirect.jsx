import { useContext, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";

export default function RootRedirect() {
  const { user, selectedEntity, loading } = useContext(UserContext);

  if (loading) return null;

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Admin
  if (user.role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Doctor
  if (user.role === "doctor") {
    return <Navigate to="/doctor-dashboard" replace />;
  }

  // Parent
  if (user.role === "parent") {
    if (!selectedEntity) {
      return <Navigate to="/account-selection" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/login" replace />;
}
