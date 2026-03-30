import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Registration.css";

const Registration = () => {
  const [formData, setFormData] = useState({
    sname: "",
    semail: "",
    spassword: "",
    sconfirmPassword: "",
    wing: "",
    house_no: "",
    building_name: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.spassword !== formData.sconfirmPassword) {
        alert("Passwords do not match!");
        setLoading(false);
        return;
      }

      const res = await axios.post("http://localhost:5000/public/secretaries", {
        sname: formData.sname,
        semail: formData.semail,
        spassword: formData.spassword,
        wing: formData.wing,
        house_no: formData.house_no,
        building_name: formData.building_name,
      });

      const { token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", "secretary");

      navigate("/secretary");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card-container">
        <div className="register-left">
          <div className="register-card">
            <h2 className="text-center mb-4">Secretary Registration</h2>

            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* LEFT COLUMN */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="sname"
                      className="form-control"
                      value={formData.sname}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="semail"
                      className="form-control"
                      value={formData.semail}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="spassword"
                      className="form-control"
                      value={formData.spassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      name="sconfirmPassword"
                      className="form-control"
                      value={formData.sconfirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Wing</label>
                    <input
                      type="text"
                      name="wing"
                      className="form-control"
                      value={formData.wing}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">House No</label>
                    <input
                      type="text"
                      name="house_no"
                      className="form-control"
                      value={formData.house_no}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Building Name</label>
                    <input
                      type="text"
                      name="building_name"
                      className="form-control"
                      value={formData.building_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success w-100 mt-3"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <p className="mt-3 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-decoration-none">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;