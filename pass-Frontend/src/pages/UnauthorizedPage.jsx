import React from "react";
import { Link } from "react-router-dom";

export const UnauthorizedPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">403</h2>
        <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
        <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
        <Link
          to="/dashboard"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
