import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AuthPages.css";

const SecretaryRegistration = () => {
  const [formData, setFormData] = useState({
    sname: "",
    semail: "",
    spassword: "",
    sconfirmPassword: "",
    wing: "",
    house_no: "",
    building_name: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.spassword !== formData.sconfirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/public/secretaries", {
        sname: formData.sname,
        semail: formData.semail,
        spassword: formData.spassword,
        wing: formData.wing,
        house_no: formData.house_no,
        building_name: formData.building_name,
      });
      const { token } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", "secretary");
      navigate("/secretary");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page secretary-theme">
      <div style={{ width: "100%", maxWidth: "680px" }}>
        <Link to="/secretary/login" className="back-link">← Back to secretary login</Link>
        <div className="auth-card wide">
          <div className="auth-header">
            <span className="role-badge">📋 Secretary</span>
            <h2>Secretary Registration</h2>
            <p>Create your secretary account to manage your building</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="sname" className="form-control"
                    value={formData.sname} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" name="semail" className="form-control"
                    value={formData.semail} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" name="spassword" className="form-control"
                    value={formData.spassword} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" name="sconfirmPassword" className="form-control"
                    value={formData.sconfirmPassword} onChange={handleChange} required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Wing</label>
                  <input type="text" name="wing" className="form-control"
                    value={formData.wing} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">House No</label>
                  <input type="text" name="house_no" className="form-control"
                    value={formData.house_no} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Building Name</label>
                  <input type="text" name="building_name" className="form-control"
                    value={formData.building_name} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Registering..." : "Create Secretary Account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?
            <Link to="/secretary/login"> Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecretaryRegistration;
