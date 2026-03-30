import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaComment } from "react-icons/fa";

const UserIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const issuesPerPage = 10;
  const navigate = useNavigate();

  // Fetch issues reported by the logged-in user
  const fetchMyIssues = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/issues", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIssues(Array.isArray(res.data.issues) ? res.data.issues : []);
    } catch (err) {
      console.error("Error fetching issues:", err.response?.data || err.message);
      setError("Failed to load your issues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIssues();
  }, []);

  // Pagination logic
  const indexOfLastIssue = currentPage * issuesPerPage;
  const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
  const currentIssues = issues.slice(indexOfFirstIssue, indexOfLastIssue);
  const totalPages = Math.ceil(issues.length / issuesPerPage);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="text-center mt-5">Loading your issues...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">📝 My Reported Issues</h2>
        <button
          className="btn btn-success"
          onClick={() => navigate("/user/report-issue")}
        >
          + Report New Issue
        </button>
      </div>

      {issues.length === 0 ? (
        <div className="alert alert-info text-center">You have not reported any issues yet.</div>
      ) : (
        <div className="table-responsive">

            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: "80px", whiteSpace: "nowrap" }}>Sr. No.</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Building</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentIssues.map((issue, index) => (
                  <tr key={issue.issue_id}>
                    <td>{indexOfFirstIssue + index + 1}</td>
                    <td>{issue.title}</td>
                    <td>{issue.category}</td>
                    <td>{issue.status}</td>
                    <td>{issue.building_name}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate("/user/add/feedback")}
                      >
                        <FaComment className="me-1" /> Feedback
                      </button>
                    </td>
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

export default UserIssues;