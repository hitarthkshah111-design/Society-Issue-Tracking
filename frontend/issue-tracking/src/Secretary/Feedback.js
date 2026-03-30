import React, { useEffect, useState } from "react";
import axios from "axios";

const SecretaryFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const feedbacksPerPage = 10; // 10 feedbacks per page

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/secretary/feedback", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeedbacks(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch feedback");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  // Pagination logic
  const totalRecords = feedbacks.length;
  const totalPages = Math.ceil(totalRecords / feedbacksPerPage);
  const startIndex = (currentPage - 1) * feedbacksPerPage;
  const endIndex = startIndex + feedbacksPerPage;
  const currentFeedbacks = feedbacks.slice(startIndex, endIndex);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="text-center mt-5">Loading feedbacks...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container-fluid px-4 mt-4">
      <h2 className="mb-3">Building Feedback (Secretary)</h2>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "100px", whiteSpace: "nowrap" }}>Sr. No.</th>
              <th>User</th>
              <th>Email</th>
              <th>Issue</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {currentFeedbacks.map((fb, index) => (
              <tr key={fb.feedback_id}>
                <td>{startIndex + index + 1}</td>
                <td>{fb.giver_name}</td>
                <td>{fb.giver_email}</td>
                <td>{fb.issue_title}</td>
                <td>{fb.feedback_text}</td>
                <td>{new Date(fb.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => goToPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default SecretaryFeedback;