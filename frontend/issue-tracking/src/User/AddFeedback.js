import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddFeedback = () => {
  const [issues, setIssues] = useState([]);
  const [issueId, setIssueId] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fetch issues reported by the current user
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("You are not logged in");

        const res = await axios.get("http://localhost:5000/issues", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIssues(res.data.issues || []);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setMessage(
          "⚠️ Could not fetch your issues. Try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issueId || !feedbackText.trim()) {
      setMessage("⚠️ Please select an issue and enter your feedback.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You are not logged in");

      const res = await axios.post(
        "http://localhost:5000/feedback",
        { issue_id: issueId, feedback_text: feedbackText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`✅ ${res.data.message}`);
      setFeedbackText("");
      setIssueId("");

      setTimeout(() => navigate("/user/feedback"), 1500);
    } catch (err) {
      console.error("Submit feedback error:", err);
      setMessage(
        `❌ ${err.response?.data?.message || "Failed to submit feedback."}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-5">⏳ Loading your issues...</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📝 Submit Feedback</h2>

      {message && (
        <div
          className={`alert ${
            message.startsWith("✅") ? "alert-success" : "alert-danger"
          }`}
        >
          {message}
        </div>
      )}

      {issues.length === 0 ? (
        <div className="alert alert-info">
          You have not reported any issues yet.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
          <div className="mb-3">
            <label className="form-label">Select Issue</label>
            <select
              className="form-select"
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              required
            >
              <option value="">-- Select Your Issue --</option>
              {issues.map((issue) => (
                <option key={issue.issue_id} value={issue.issue_id}>
                  {issue.title} ({issue.status}) - {issue.building_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Feedback</label>
            <textarea
              className="form-control"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              placeholder="Write your feedback here..."
              required
            />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/user/issues")}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddFeedback;