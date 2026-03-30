import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
};

const ReportIssue = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [building, setBuilding] = useState("");
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = parseJwt(token);
    if (decoded?.building_name) setBuilding(decoded.building_name);
  }, []);

  useEffect(() => {
    if (files.length === 0) {
      setFilePreviews([]);
      return;
    }
    const previews = Array.from(files).map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category) {
      return setMessage("⚠️ Please fill all required fields.");
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    Array.from(files).forEach((file) => formData.append("images", file));

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/issues", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      setMessage(`✅ ${res.data.message}. Notifications sent to secretary and admin.`);
      setTitle(""); setDescription(""); setCategory(""); setFiles([]); setFilePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => navigate("/user/"), 1500);
    } catch (err) {
      console.error(err);
      setMessage(`❌ ${err.response?.data?.message || "Failed to report issue"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Report New Issue</h2>
      {message && <div className={`alert ${message.startsWith("✅") ? "alert-success" : "alert-danger"}`}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Title</label>
          <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Description</label>
          <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Category</label>
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">-- Select Category --</option>
            <option value="Personal">Personal</option>
            <option value="General">General</option>
          </select>
        </div>
        <div className="mb-3">
          <label>Building</label>
          <input type="text" className="form-control" value={building} readOnly />
        </div>
        <div className="mb-3">
          <label>Upload Images (Optional)</label>
          <input type="file" className="form-control" multiple ref={fileInputRef} onChange={(e) => setFiles(e.target.files)} />
        </div>
        {filePreviews.length > 0 && (
          <div className="mb-3 d-flex gap-2 flex-wrap">
            {filePreviews.map((src, idx) => <img key={idx} src={src} alt="preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" }} />)}
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "⏳ Reporting..." : "Submit Issue"}</button>
      </form>
    </div>
  );
};

export default ReportIssue;