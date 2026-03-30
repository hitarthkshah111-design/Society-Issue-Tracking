import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    user_id: "",
    name: "",
    email: "",
    building: "",
    wing: "",
    houseNo: "",
    secretaryId: "",
    secretaryName: "",
    password: "",
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [secretaries, setSecretaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        setProfile({
          user_id: data.user_id || "",
          name: data.uname || "",
          email: data.uemail || "",
          building: data.building_name || "",
          wing: data.wing || "",
          houseNo: data.house_no || "",
          secretaryId: data.secretary_id || "",
          secretaryName: data.secretary_name || "",
          password: "",
        });

        if (data.building_name) {
          fetchSecretaries(data.building_name, data.secretary_id);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch secretaries for the building
  const fetchSecretaries = async (buildingName, selectedSecretaryId = "") => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/public/secretaries/building?name=${buildingName}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSecretaries(res.data || []);

      if (selectedSecretaryId) {
        setProfile((prev) => ({ ...prev, secretaryId: selectedSecretaryId }));
      } else {
        setProfile((prev) => ({ ...prev, secretaryId: "" }));
      }
    } catch (err) {
      console.error("Error fetching secretaries:", err);
      setSecretaries([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });

    if (name === "building") {
      fetchSecretaries(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (profile.password && profile.password !== passwordConfirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/user/profile",
        { ...profile, password: profile.password || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Profile updated successfully!");
      setPasswordConfirm("");
      setProfile((prev) => ({ ...prev, password: "" }));

      // Redirect after 1.5s
      setTimeout(() => {
        navigate("/user");
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed!");
    }
  };

  const handleCancel = () => {
    navigate("/user");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="text-center mb-4">User Profile</h2>

        {message && <div className="alert alert-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Left Column */}
            <div className="col-md-6">
              <div className="mb-3">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={profile.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Building</label>
                <input
                  type="text"
                  name="building"
                  className="form-control"
                  value={profile.building}
                  onChange={handleChange}
                  required
                />
              </div>

              {secretaries.length > 0 && (
                <div className="mb-3">
                  <label>Secretary</label>
                  <select
                    name="secretaryId"
                    className="form-control"
                    value={profile.secretaryId}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Secretary --</option>
                    {secretaries.map((sec) => (
                      <option key={sec.secretary_id} value={sec.secretary_id}>
                        {sec.sname}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3">
                <label>House No</label>
                <input
                  type="text"
                  name="houseNo"
                  className="form-control"
                  value={profile.houseNo}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-6">
              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={profile.email}
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
                />
              </div>

              <div className="mb-3">
                <label>New Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={profile.password}
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
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-start mt-3">
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

export default UserProfile;