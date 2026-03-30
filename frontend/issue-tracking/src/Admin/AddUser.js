import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddUser = () => {
  const [formData, setFormData] = useState({
    uname: "",
    uemail: "",
    upassword: "",
    confirmPassword: "",
    wing: "",
    house_no: "",
    building_name: "" // Only used if admin
  });

  const [role, setRole] = useState("");
  const [buildings, setBuildings] = useState([]); // For admin dropdown
  const navigate = useNavigate();

  useEffect(() => {
    // Decode role from token (stored at login)
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role) {
      setRole(user.role);
    }

    // If admin, fetch building list for dropdown
    const fetchBuildings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/buildings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBuildings(res.data || []);
      } catch (err) {
        console.error("Error fetching buildings:", err);
      }
    };

    if (user?.role === "admin") {
      fetchBuildings();
    }
  }, []);

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

      // For secretary → don't send building_name (backend picks from token)
      const payload = { ...formData };
      if (role === "secretary") delete payload.building_name;

      await axios.post("http://localhost:5000/users/add", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User added successfully");
      navigate("/secretary/users");
    } catch (err) {
      console.error("Error adding user:", err);
      toast.error(err.response?.data?.message || "Failed to add user");
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h2 className="mb-4">
        {role === "admin" ? "Add New User (Admin)" : "Add New User"}
      </h2>

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

        {role === "admin" && (
          <div className="col-md-12">
            <label className="form-label">Building</label>
            <select
              className="form-control"
              name="building_name"
              value={formData.building_name}
              onChange={handleChange}
              required
            >
              <option value="">Select Building</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.building_name}>
                  {b.building_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="col-12">
          <button type="submit" className="btn btn-success">
            Add User
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => navigate("/secretary/users")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;