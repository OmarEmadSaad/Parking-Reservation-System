import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireEmployee?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireEmployee = false,
}) => {
  const { isAuthenticated, isAdmin, isEmployee } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin && location.pathname !== "/") {
    console.log("Redirecting because user is not admin");
    return <Navigate to={isEmployee ? "/checkpoint" : "/"} replace />;
  }

  if (requireEmployee && !isEmployee && !isAdmin && location.pathname !== "/") {
    console.log("Redirecting because user is neither employee nor admin");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
