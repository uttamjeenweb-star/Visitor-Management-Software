import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    let newSocket;

    if (isAuthenticated) {
      const token = localStorage.getItem("accessToken");
      
      newSocket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000", {
        auth: { token },
        withCredentials: true,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
      });

      newSocket.on("new_notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      newSocket.on("data_updated", (data) => {
        if (data && data.type) {
          queryClient.invalidateQueries({ queryKey: [data.type] });
        }
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) newSocket.close();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
