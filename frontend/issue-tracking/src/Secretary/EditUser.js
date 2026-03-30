import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditUserSecretary = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    uname: "",
    uemail: "",
    upassword: "",
    wing: "",
    house_no: "",
    building_name: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        toast.error(err.response?.data?.message || "Failed to fetch user");
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/users/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User updated successfully");
      navigate("/secretary/users");
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h2 className="mb-4">Edit User</h2>
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
            placeholder="Enter new password (leave blank to keep current)"
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

        <div className="col-12">
          <button type="submit" className="btn btn-primary">Update User</button>
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

export default EditUserSecretary;