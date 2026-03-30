import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import "./AdminTable.css";

const AdminIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const issuesPerPage = 10;

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return setError("No authentication token found. Please login.");
    }

    try {
      const res = await axios.get("http://localhost:5000/issues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIssues(Array.isArray(res.data) ? res.data : res.data.issues || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch issues. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIssues(issues.filter((issue) => issue.issue_id !== id && issue.id !== id));
      alert("Issue deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete issue");
    }
  };

  // Pagination
  const indexOfLastIssue = currentPage * issuesPerPage;
  const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
  const currentIssues = issues.slice(indexOfFirstIssue, indexOfLastIssue);
  const totalPages = Math.ceil(issues.length / issuesPerPage);

  if (loading) return <div className="text-center mt-5">Loading issues...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="user-table-wrapper">
      <div className="table-header-row">
        <h2>Issues</h2>
      </div>

      <div className="table-container">
        <table className="table user-table table-hover align-middle">
          <thead>
            <tr>
              <th className="text-center" style={{ width: "100px", whiteSpace: "nowrap" }}>Sr. No</th>
              <th>Title</th>
              <th>Status</th>
              <th>Submitted By</th>
              <th className="text-center" style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentIssues.map((issue, index) => (
              <tr key={issue.id || issue.issue_id}>
                <td className="text-center">{indexOfFirstIssue + index + 1}</td>
                <td style={{ fontWeight: "500" }}>{issue.title}</td>
                <td>
                  <span 
                    className="badge" 
                    style={{ 
                      backgroundColor: 
                        issue.status === "Pending" ? "#FFC107" : 
                        issue.status === "In Progress" ? "#0DCAF0" : 
                        issue.status === "Resolved" ? "#198754" : "#6C757D",
                      color: issue.status === "Pending" ? "#000" : "#fff",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontWeight: "500",
                      fontSize: "12px"
                    }}
                  >
                    {issue.status}
                  </span>
                </td>
                <td>{issue.reporter_name || "-"}</td>
                <td className="text-center">
                  <FaTrash
                    className="text-danger"
                    style={{ cursor: "pointer", fontSize: "1.2rem" }}
                    onClick={() => handleDelete(issue.issue_id || issue.id)}
                    title="Delete"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Custom Pagination Style */}
        <div className="pagination-container">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          
          <span className="pagination-info mx-3">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminIssues;