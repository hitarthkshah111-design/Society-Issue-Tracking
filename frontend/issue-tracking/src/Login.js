import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AuthPages.css";

const Login = () => {
  return (
    <div className="role-select-page">
      <div className="brand">
        <h1>🏢 Society Issue Tracker</h1>
        <p>Select your role to continue</p>
      </div>

      <div className="role-cards">
        <Link to="/admin/login" className="role-card">
          <span className="role-icon">🛡️</span>
          <p className="role-name">Admin</p>
          <p className="role-desc">Full system management</p>
        </Link>

        <Link to="/secretary/login" className="role-card">
          <span className="role-icon">📋</span>
          <p className="role-name">Secretary</p>
          <p className="role-desc">Manage building issues</p>
        </Link>

        <Link to="/user/login" className="role-card">
          <span className="role-icon">👤</span>
          <p className="role-name">Resident</p>
          <p className="role-desc">Report &amp; track issues</p>
        </Link>
      </div>
    </div>
  );
};

export default Login;