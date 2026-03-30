import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser } from "./AuthUtils";

const SecretaryRoute = ({ children }) => {
  const user = getStoredUser("secretary");

  return user ? children : <Navigate to="/login" replace />;
};

export default SecretaryRoute;