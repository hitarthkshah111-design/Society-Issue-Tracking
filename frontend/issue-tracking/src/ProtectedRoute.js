// src/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ role, children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // redirect them to their own dashboard if they try wrong route
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "secretary") return <Navigate to="/secretary" replace />;
    if (user.role === "user") return <Navigate to="/user" replace />;
  }

  return children;
};

export default ProtectedRoute;