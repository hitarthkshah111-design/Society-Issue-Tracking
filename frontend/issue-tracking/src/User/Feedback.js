import React, { useEffect, useState } from "react";
import axios from "axios";

const UserFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const feedbacksPerPage = 10;

  // Fetch feedbacks submitted by the current user
  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/user/feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
      setError(err.response?.data?.message || "Failed to fetch feedbacks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Pagination logic
  const indexOfLastFeedback = currentPage * feedbacksPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
  const currentFeedbacks = feedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);
  const totalPages = Math.ceil(feedbacks.length / feedbacksPerPage);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="text-center mt-5">Loading feedbacks...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container-fluid px-4 py-4">
      <h2 className="mb-4">My Feedbacks</h2>

      {feedbacks.length === 0 ? (
        <div className="alert alert-info text-center">
          You have not submitted any feedback yet.
        </div>
      ) : (
        <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: "80px", whiteSpace: "nowrap" }}>Sr. No.</th>
                  <th>Issue</th>
                  <th>Message</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {currentFeedbacks.map((fb, index) => (
                  <tr key={fb.feedback_id}>
                    <td>{indexOfFirstFeedback + index + 1}</td>
                    <td>{fb.issue_title}</td>
                    <td>{fb.feedback_text}</td>
                    <td>{new Date(fb.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-3">
                <ul className="pagination justify-content-center pagination-sm mb-0">
                  {[...Array(totalPages)].map((_, i) => (
                    <li
                      key={i}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      <button className="page-link" onClick={() => goToPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
        </div>
      )}
    </div>
  );
};

export default UserFeedback;