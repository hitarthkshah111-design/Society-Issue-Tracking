import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import "./AdminTable.css";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/admin/feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
      alert("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(feedbacks.filter((fb) => fb.feedback_id !== id));
      alert("Feedback deleted successfully");
    } catch (err) {
      console.error("Failed to delete feedback:", err);
      alert("Failed to delete feedback");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading feedbacks...</p>;

  // Pagination logic
  const totalPages = Math.ceil(feedbacks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFeedbacks = feedbacks.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="user-table-wrapper">
      <div className="table-header-row">
        <h2>Admin Feedbacks</h2>
      </div>

      <div className="table-container">
        <table className="table user-table table-hover align-middle">
          <thead>
            <tr>
              <th className="text-center" style={{ width: "100px", whiteSpace: "nowrap" }}>Sr No.</th>
              <th>Feedback</th>
              <th>Giver Name</th>
              <th>Giver Email</th>
              <th>Issue Title</th>
              <th>Building</th>
              <th>Date</th>
              <th className="text-center" style={{ width: "100px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentFeedbacks.map((fb, index) => (
              <tr key={fb.feedback_id}>
                <td className="text-center">{indexOfFirstItem + index + 1}</td>
                <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {fb.feedback_text}
                </td>
                <td style={{ fontWeight: "500" }}>{fb.giver_name}</td>
                <td>{fb.giver_email}</td>
                <td>{fb.issue_title || "-"}</td>
                <td>{fb.building_name || "-"}</td>
                <td>{new Date(fb.created_at).toLocaleDateString()}</td>
                <td className="text-center">
                  <FaTrash
                    className="text-danger"
                    style={{ cursor: "pointer", fontSize: "1.2rem" }}
                    onClick={() => handleDelete(fb.feedback_id)}
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
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          
          <span className="pagination-info mx-3">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;