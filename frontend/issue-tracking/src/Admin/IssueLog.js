import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import "./AdminTable.css";

const AdminIssueLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return setError("No authentication token found. Please login.");
    }

    try {
      const res = await axios.get("http://localhost:5000/issue-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedLogs = Array.isArray(res.data) ? res.data : [];
      const sortedLogs = fetchedLogs.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setLogs(sortedLogs);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch logs. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;

    const token = localStorage.getItem("token");
    if (!token) return setError("No authentication token found. Please login.");

    try {
      await axios.delete(`http://localhost:5000/issue-logs/${logId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs((prev) => prev.filter((log) => log.log_id !== logId && log.id !== logId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete log.");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <div className="text-center mt-4">Loading issue logs...</div>;
  if (error) return <div className="text-danger text-center mt-4">{error}</div>;

  // Pagination
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="user-table-wrapper">
      <div className="table-header-row">
        <h2>Issue Logs</h2>
      </div>

      <div className="table-container">
        <table className="table user-table table-hover align-middle">
          <thead>
            <tr>
              <th className="text-center" style={{ width: "100px" }}>Issue ID</th>
              <th>Action</th>
              <th>Created At</th>
              <th className="text-center" style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log) => (
              <tr key={log.log_id || log.id}>
                <td className="text-center" style={{ fontWeight: "500" }}>{log.issue_id}</td>
                <td>{log.action}</td>
                <td>{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</td>
                <td className="text-center">
                  <FaTrash
                    className="text-danger"
                    style={{ cursor: "pointer", fontSize: "1.2rem" }}
                    onClick={() => handleDelete(log.log_id || log.id)}
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

export default AdminIssueLog;