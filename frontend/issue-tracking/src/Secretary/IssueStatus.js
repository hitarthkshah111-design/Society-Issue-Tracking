import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const SecretaryIssueStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const ALLOWED_STATUSES = ["Pending", "In Progress", "Resolved"];
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/issues/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setIssue(res.data);
        setStatus(res.data.status);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to fetch issue details");
      } finally { setLoading(false); }
    };
    fetchIssue();
  }, [id, token]);

  const handleUpdate = async () => {
    if (status === issue.status) return;
    try {
      setSubmitting(true);
      const res = await axios.put(`http://localhost:5000/issues/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage(`✅ ${res.data.message} Notifications sent to user and admins.`);
      setIssue((prev) => ({ ...prev, status }));
      setTimeout(() => navigate("/secretary/issues"), 1500);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || "Failed to update issue"}`);
    } finally { setSubmitting(false); }
  };

  if (loading) return <p className="text-center mt-5">⏳ Loading issue details...</p>;
  if (!issue) return <p className="text-center mt-5 text-danger">{message || "Issue not found"}</p>;

  return (
    <div className="container mt-5">
      <h2>Update Issue #{issue.issue_id}</h2>
      <p><strong>Title:</strong> {issue.title}</p>
      <p><strong>Status:</strong> {issue.status}</p>
      <p><strong>Reporter:</strong> {issue.reporter_name}</p>
      <select className="form-select mb-3" value={status} onChange={(e) => setStatus(e.target.value)} disabled={submitting}>
        {ALLOWED_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={handleUpdate} disabled={submitting || status === issue.status}>{submitting ? "Updating..." : "Update Status"}</button>
        <button className="btn btn-secondary" onClick={() => navigate("/secretary/issues")} disabled={submitting}>Cancel</button>
      </div>
      {message && <div className={`alert mt-3 ${message.startsWith("✅") ? "alert-success" : "alert-danger"}`}>{message}</div>}
    </div>
  );
};

export default SecretaryIssueStatus;