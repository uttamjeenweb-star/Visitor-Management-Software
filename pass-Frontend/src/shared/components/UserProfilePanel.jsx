import React, { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/shared/ui/atoms/Button";
import { cn } from "@/shared/utils/cn";

export const UserProfilePanel = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">USER PROFILE DETAILS</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close Profile">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-500 font-medium col-span-1">Employee ID:</span>
              <span className="font-semibold text-gray-900 col-span-2">{user?.employeeId || "N/A"}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-500 font-medium col-span-1">Full Name:</span>
              <span className="font-semibold text-gray-900 col-span-2">{user?.name || "N/A"}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-500 font-medium col-span-1">Department:</span>
              <span className="font-semibold text-gray-900 col-span-2">{user?.departmentRef?.name || user?.department || "N/A"}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-500 font-medium col-span-1">Designation:</span>
              <span className="font-semibold text-gray-900 col-span-2">{user?.designation || "N/A"}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center mt-6 p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-500 font-medium col-span-1">System Password:</span>
              <div className="col-span-2 flex items-center justify-between">
                <span className="font-mono text-gray-700 tracking-widest">
                  {showPassword ? (user?.systemPassword || "N/A") : "••••••••"}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-8 w-8 ml-2"
                  title="Passwords are encrypted for security"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">MY ALLOWED PERMISSIONS</h3>
            {user?.role === "Super Admin" ? (
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  All Menus & Actions (Super Admin)
                </li>
              </ul>
            ) : (
              <ul className="space-y-2">
                {user?.roleRef?.permissions?.map((p, idx) => (
                  <React.Fragment key={idx}>
                    {(p.canRead || p.canCreate || p.canUpdate || p.canDelete) && (
                      <li className="flex items-center text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        Menu: {p.module}
                      </li>
                    )}
                    {Object.entries(p.dashboardActions || {}).map(([actionName, allowed], aIdx) => allowed && (
                      <li key={`action-${aIdx}`} className="flex items-center text-sm text-gray-700 ml-4">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        Action: {actionName}
                      </li>
                    ))}
                  </React.Fragment>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">MY CURRENT ACTIVE SESSIONS</h3>
            <ul className="space-y-3 mb-6">
              <li className="text-sm text-gray-700 p-3 bg-blue-50/50 rounded-md border border-blue-100">
                <span className="font-medium block text-blue-900">Chrome on Windows</span>
                <span className="text-xs text-blue-600 block mt-1">(Current Session)</span>
              </li>
              <li className="text-sm text-gray-700 p-3 bg-gray-50 rounded-md border">
                <span className="font-medium block">VMS Mobile App on Android</span>
              </li>
            </ul>
            <div className="flex justify-end">
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                Logout All Devices
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
