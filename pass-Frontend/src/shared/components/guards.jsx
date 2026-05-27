import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export const PermissionRoute = ({ module, actions = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.roleRef?.name === "Super Admin") return <Outlet />;

  const hasAccess = user?.roleRef?.permissions?.some((p) => {
    if (p.module !== module) return false;
    // Check if the user has AT LEAST ONE of the required actions (or all? Usually at least one if it's an array)
    if (actions.length === 0) return true; // Just module access is enough
    return actions.every((action) => p[action] === true);
  });

  return hasAccess ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export const SuperAdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return user?.roleRef?.name === "Super Admin" ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};
