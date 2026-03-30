// src/Admin/AddSecretary.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddSecretary = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "spassword") validatePassword(value);
    if (name === "confirmPassword")
      validateConfirmPassword(form.spassword, value);
  };

  const validatePassword = (password) => {
    const strongPassword = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;
    setPasswordError(
      strongPassword.test(password)
        ? ""
        : "Password must be 6+ chars, include 1 uppercase, 1 number & 1 special char."
    );
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    setConfirmError(password !== confirmPassword ? "Passwords do not match." : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordError || confirmError) return toast.error("Fix errors before submitting");

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/secretaries", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Secretary added successfully!");
      navigate("/admin/secretaries");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add secretary");
    }
  };

  return (
    <div className="container mt-3">
      <h3>Add Secretary</h3>
      <form onSubmit={handleSubmit}>
        <InputField label="Name" name="sname" value={form.sname} onChange={handleChange} required />
        <InputField label="Email" name="semail" type="email" value={form.semail} onChange={handleChange} required />
        <InputField label="Password" name="spassword" type="password" value={form.spassword} onChange={handleChange} error={passwordError} required />
        <InputField label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={confirmError} required />
        <InputField label="Wing" name="wing" value={form.wing} onChange={handleChange} />
        <InputField label="House No" name="house_no" value={form.house_no} onChange={handleChange} />
        <InputField label="Building Name" name="building_name" value={form.building_name} onChange={handleChange} required />
        <button type="submit" className="btn btn-primary me-2">Add Secretary</button>
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

export default AddSecretary;