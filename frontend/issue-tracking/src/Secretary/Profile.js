import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SecretaryProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    sname: "",
    semail: "",
    building_name: "",
    wing: "",
    house_no: "",
    spassword: "",
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Fetch profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/secretary/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mappedProfile = {
          sname: res.data.sname || "",
          semail: res.data.semail || "",
          building_name: res.data.building_name || "",
          wing: res.data.wing || "",
          house_no: res.data.house_no || "",
          spassword: "",
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
    if (profile.spassword && profile.spassword !== passwordConfirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/secretary/profile",
        { ...profile, spassword: profile.spassword || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Profile updated successfully");
      setOriginalProfile(profile);
      setPasswordConfirm("");
      setTimeout(() => navigate("/secretary"), 1000); // redirect to dashboard
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setPasswordConfirm("");
    setMessage("");
    navigate("/secretary"); // redirect to dashboard
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="text-center mb-4">Secretary Profile</h2>
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Name</label>
            <input
              type="text"
              name="sname"
              className="form-control"
              value={profile.sname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              name="semail"
              className="form-control"
              value={profile.semail}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Building Name</label>
            <input
              type="text"
              name="building_name"
              className="form-control"
              value={profile.building_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Wing</label>
            <input
              type="text"
              name="wing"
              className="form-control"
              value={profile.wing}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>House No</label>
            <input
              type="text"
              name="house_no"
              className="form-control"
              value={profile.house_no}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>New Password</label>
            <input
              type="password"
              name="spassword"
              className="form-control"
              value={profile.spassword}
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
          <div className="d-flex gap-2 justify-content-start">
            <button type="submit" className="btn btn-primary">
              Update Profile
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecretaryProfile;