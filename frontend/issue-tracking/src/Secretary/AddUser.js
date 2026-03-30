import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddUserSecretary = () => {
  const user = JSON.parse(localStorage.getItem("user")); // decoded user from login
  const role = user?.role || "user";

  const [formData, setFormData] = useState({
    uname: "",
    uemail: "",
    upassword: "",
    confirmPassword: "",
    wing: "",
    house_no: "",
    building_name: role === "admin" ? "" : undefined, // only needed for admin
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.upassword !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/users/add", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User added successfully");
      navigate("/secretary/users"); // or /admin/users if admin
    } catch (err) {
      console.error("Error adding user:", err);
      toast.error(err.response?.data?.error || "Failed to add user");
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h2 className="mb-4">{role === "admin" ? "Add New User (Admin)" : "Add New User"}</h2>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            name="uname"
            value={formData.uname}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="uemail"
            value={formData.uemail}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="upassword"
            value={formData.upassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Wing</label>
          <input
            type="text"
            className="form-control"
            name="wing"
            value={formData.wing}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">House No</label>
          <input
            type="text"
            className="form-control"
            name="house_no"
            value={formData.house_no}
            onChange={handleChange}
            required
          />
        </div>

        {/* Only show for admin */}
        {role === "admin" && (
          <div className="col-md-6">
            <label className="form-label">Building Name</label>
            <input
              type="text"
              className="form-control"
              name="building_name"
              value={formData.building_name}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="col-12">
          <button type="submit" className="btn btn-success">
            Add User
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() =>
              role === "admin"
                ? navigate("/admin/users")
                : navigate("/secretary/users")
            }
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserSecretary;