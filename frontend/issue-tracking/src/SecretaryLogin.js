import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AuthPages.css";

const SecretaryLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/auth/secretary/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/secretary");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page secretary-theme">
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <Link to="/login" className="back-link">← Back to role selection</Link>
        <div className="auth-card">
          <div className="auth-header">
            <span className="role-badge">📋 Secretary</span>
            <h2>Secretary Login</h2>
            <p>Sign in to manage your building's issues</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="secretary@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In as Secretary"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?
            <Link to="/secretary/register"> Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecretaryLogin;
