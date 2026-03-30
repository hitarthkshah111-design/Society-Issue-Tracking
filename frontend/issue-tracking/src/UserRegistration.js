import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AuthPages.css";

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    uname: "",
    uemail: "",
    upassword: "",
    uconfirmPassword: "",
    wing: "",
    house_no: "",
    building_name: "",
  });
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/buildings")
      .then((res) => setBuildings(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.upassword !== formData.uconfirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/public/users", {
        uname: formData.uname,
        uemail: formData.uemail,
        upassword: formData.upassword,
        wing: formData.wing,
        house_no: formData.house_no,
        building_name: formData.building_name,
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/user");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page user-theme">
      <div style={{ width: "100%", maxWidth: "680px" }}>
        <Link to="/user/login" className="back-link">← Back to user login</Link>
        <div className="auth-card wide">
          <div className="auth-header">
            <span className="role-badge">👤 Resident</span>
            <h2>Create Your Account</h2>
            <p>Register as a resident to report and track society issues</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="uname" className="form-control"
                    value={formData.uname} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" name="uemail" className="form-control"
                    value={formData.uemail} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" name="upassword" className="form-control"
                    value={formData.upassword} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" name="uconfirmPassword" className="form-control"
                    value={formData.uconfirmPassword} onChange={handleChange} required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Building Name</label>
                  {buildings.length > 0 ? (
                    <select name="building_name" className="form-control"
                      value={formData.building_name} onChange={handleChange} required>
                      <option value="">-- Select Building --</option>
                      {buildings.map((b) => (
                        <option key={b.building_name} value={b.building_name}>
                          {b.building_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" name="building_name" className="form-control"
                      placeholder="Enter building name"
                      value={formData.building_name} onChange={handleChange} required />
                  )}
                </div>
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
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?
            <Link to="/user/login"> Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
