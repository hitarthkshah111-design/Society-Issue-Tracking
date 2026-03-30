// src/Admin/EditSecretary.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditSecretary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    sname: "",
    semail: "",
    spassword: "",
    confirmPassword: "",
    wing: "",
    house_no: "",
    building_name: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load secretary details
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`http://localhost:5000/secretaries/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const data = res.data;
        setForm({
          sname: data.sname || "",
          semail: data.semail || "",
          spassword: "",
          confirmPassword: "",
          wing: data.wing || "",
          house_no: data.house_no || "",
          building_name: data.building_name || "",
        });
      })
      .catch(() => toast.error("Failed to load secretary"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "spassword") validatePassword(value);
    if (name === "confirmPassword") validateConfirmPassword(form.spassword, value);
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("");
      return;
    }
    const strongPassword = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;
    setPasswordError(strongPassword.test(password) ? "" : "Password must be 6+ chars, include 1 uppercase, 1 number & 1 special char.");
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    setConfirmError(password !== confirmPassword ? "Passwords do not match." : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordError || confirmError) return toast.error("Fix errors before submitting");

    try {
      const token = localStorage.getItem("token");
      const updateData = { ...form };
      if (!updateData.spassword) delete updateData.spassword;

      await axios.put(`http://localhost:5000/secretaries/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Secretary updated successfully!");
      navigate("/admin/secretaries");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update secretary");
    }
  };

  if (loading) return <div className="container mt-3">Loading...</div>;

  return (
    <div className="container mt-3">
      <h3>Edit Secretary</h3>
      <form onSubmit={handleSubmit}>
        <InputField label="Name" name="sname" value={form.sname} onChange={handleChange} required />
        <InputField label="Email" name="semail" type="email" value={form.semail} onChange={handleChange} required />
        <InputField label="New Password (leave blank to keep current)" name="spassword" type="password" value={form.spassword} onChange={handleChange} error={passwordError} />
        <InputField label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={confirmError} />
        <InputField label="Wing" name="wing" value={form.wing} onChange={handleChange} />
        <InputField label="House No" name="house_no" value={form.house_no} onChange={handleChange} />
        <InputField label="Building Name" name="building_name" value={form.building_name} onChange={handleChange} required />
        <button type="submit" className="btn btn-primary me-2">Update Secretary</button>
        <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/secretaries")}>Cancel</button>
      </form>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
};

const InputField = ({ label, error, ...props }) => (
  <div className="mb-3">
    <label>{label}</label>
    <input {...props} className={`form-control ${error ? "is-invalid" : ""}`} />
    {error && <small className="text-danger">{error}</small>}
  </div>
);

export default EditSecretary;