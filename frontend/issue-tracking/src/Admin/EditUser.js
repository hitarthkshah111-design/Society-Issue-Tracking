// src/Admin/EditUser.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    uname: "",
    uemail: "",
    upassword: "",
    confirmPassword: "",
    wing: "",
    house_no: "",
    building_name: "",
    secretary_id: "",
  });

  const [secretaries, setSecretaries] = useState([]);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load all secretaries
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/secretaries", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSecretaries(res.data))
      .catch(() => toast.error("Failed to load secretaries"));
  }, []);

  // Load current user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:5000/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setForm({
          uname: data.uname || data.name || "",
          uemail: data.uemail || data.email || "",
          upassword: "",
          confirmPassword: "",
          wing: data.wing || "",
          house_no: data.house_no || "",
          building_name: data.building_name || "",
          secretary_id: data.secretary_id || "",
        });
      })
      .catch(() => toast.error("Failed to load user"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "upassword") validatePassword(value);
    if (name === "confirmPassword")
      validateConfirmPassword(form.upassword, value);
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("");
      return;
    }
    const strongPassword =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;
    setPasswordError(
      strongPassword.test(password)
        ? ""
        : "Password must be 6+ chars, include 1 uppercase, 1 number & 1 special char."
    );
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    setConfirmError(password !== confirmPassword ? "Passwords do not match." : "");
  };

  const filteredSecretaries = secretaries.filter(
    (s) =>
      form.building_name &&
      s.building_name?.toLowerCase() === form.building_name.toLowerCase()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordError || confirmError) {
      toast.error("Fix errors before submitting");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const updateData = { ...form };
      if (!form.upassword) delete updateData.upassword; // do not send empty password

      await axios.put(`http://localhost:5000/users/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User updated successfully!");
      navigate("/admin/users");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  if (loading) return <div className="container mt-3">Loading...</div>;

  return (
    <div className="container mt-3">
      <h3>Edit User</h3>
      <form onSubmit={handleSubmit}>
        {/* Name & Email */}
        <div className="mb-3">
          <label>Name</label>
          <input
            type="text"
            name="uname"
            className="form-control"
            value={form.uname}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            name="uemail"
            className="form-control"
            value={form.uemail}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password & Confirm */}
        <div className="mb-3">
          <label>New Password (leave blank to keep current)</label>
          <input
            type="password"
            name="upassword"
            className={`form-control ${passwordError ? "is-invalid" : ""}`}
            value={form.upassword}
            onChange={handleChange}
          />
          {passwordError && <small className="text-danger">{passwordError}</small>}
        </div>
        <div className="mb-3">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            className={`form-control ${confirmError ? "is-invalid" : ""}`}
            value={form.confirmPassword}
            onChange={handleChange}
          />
          {confirmError && <small className="text-danger">{confirmError}</small>}
        </div>

        {/* Wing, House No, Building */}
        <div className="mb-3">
          <label>Wing</label>
          <input
            type="text"
            name="wing"
            className="form-control"
            value={form.wing}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label>House No</label>
          <input
            type="text"
            name="house_no"
            className="form-control"
            value={form.house_no}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label>Building Name</label>
          <input
            type="text"
            name="building_name"
            className="form-control"
            value={form.building_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Secretary selection */}
        {filteredSecretaries.length > 0 ? (
          <div className="mb-3">
            <label>Secretary</label>
            <select
              name="secretary_id"
              className="form-select"
              value={form.secretary_id}
              onChange={handleChange}
            >
              <option value="">-- Select Secretary --</option>
              {filteredSecretaries.map((s) => (
                <option key={s.secretary_id} value={s.secretary_id}>
                  {s.sname} ({s.semail})
                </option>
              ))}
            </select>
          </div>
        ) : form.building_name && (
          <p className="text-muted small">No secretary found for this building</p>
        )}

        <button type="submit" className="btn btn-primary me-2">Update User</button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/admin/users")}
        >
          Cancel
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default EditUser;