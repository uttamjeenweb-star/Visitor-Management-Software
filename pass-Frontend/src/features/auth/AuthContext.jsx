import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../shared/services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        // Only fetch if we have a token (ApiClient will inject it)
        const res = await api.get("/auth/me");
        setUser(res.data.data.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("accessToken");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { accessToken, data } = res.data;
    localStorage.setItem("accessToken", accessToken);
    setUser(data.user);
    setIsAuthenticated(true);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/login";
    }
  };

  const hasActionToken = (token) => {
    if (user?.role === "Super Admin") return true;
    if (!user?.roleRef?.permissions) return false;
    
    const [feature, action] = token.split(":");
    return user.roleRef.permissions.some(p => {
      if (p.module.toLowerCase() === feature.toLowerCase()) {
         if (action === "create") return p.canCreate;
         if (action === "read") return p.canRead;
         if (action === "update") return p.canUpdate;
         if (action === "delete") return p.canDelete;
         if (action === "access") return true; 
         if (p.dashboardActions && p.dashboardActions[action]) return true;
      }
      return false;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, fetchUser, hasActionToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
