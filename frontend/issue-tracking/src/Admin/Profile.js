import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ aemail: "", apassword: "" });
  const [originalProfile, setOriginalProfile] = useState({ aemail: "", apassword: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Map backend response to frontend keys
        const mappedProfile = {
          aemail: res.data.admin_email,
          apassword: "",
        };
        setProfile(mappedProfile);
        setOriginalProfile(mappedProfile);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (profile.apassword && profile.apassword !== passwordConfirm) {
      alert("Passwords do not match");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/admin/profile",
        {
          aemail: profile.aemail,
          apassword: profile.apassword || undefined, // only send if not empty
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile updated successfully");
      setOriginalProfile(profile);
      setPasswordConfirm("");
      setTimeout(() => navigate("/admin"), 1000); // redirect to dashboard after 1s
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setPasswordConfirm("");
    setMessage("");
    navigate("/admin"); // redirect to dashboard on cancel
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="text-center mb-4">Admin Profile</h2>
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              name="aemail"
              className="form-control"
              value={profile.aemail}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>New Password</label>
            <input
              type="password"
              name="apassword"
              className="form-control"
              value={profile.apassword}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="mb-3">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
                Update Profile
            </button>
            <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
            >
                Cancel
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;