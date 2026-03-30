import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./AdminTable.css";

const AdminSecretaries = () => {
  const [secretaries, setSecretaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const secretariesPerPage = 10;

  useEffect(() => {
    fetchSecretaries();
  }, []);

  const fetchSecretaries = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return setError("No authentication token found. Please login.");
    }

    try {
      const res = await axios.get("http://localhost:5000/secretaries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSecretaries(
        Array.isArray(res.data) ? res.data : res.data.secretaries || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch secretaries. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this secretary?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/secretaries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSecretaries(
        secretaries.filter((sec) => sec.secretary_id !== id && sec.id !== id)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete secretary");
    }
  };

  const handleEdit = (id) => {
    window.location.href = `/admin/secretaries/edit/${id}`;
  };

  const handleAdd = () => {
    window.location.href = "/admin/secretaries/add";
  };

  // Pagination
  const indexOfLastSecretary = currentPage * secretariesPerPage;
  const indexOfFirstSecretary = indexOfLastSecretary - secretariesPerPage;
  const currentSecretaries = secretaries.slice(
    indexOfFirstSecretary,
    indexOfLastSecretary
  );
  const totalPages = Math.ceil(secretaries.length / secretariesPerPage);

  if (loading) return <div className="text-center mt-4">Loading secretaries...</div>;
  if (error) return <div className="text-danger text-center mt-4">{error}</div>;

  return (
    <div className="user-table-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4 w-100">
        <h2 className="m-0">Secretaries</h2>
        <button className="btn btn-success px-4 py-2" onClick={handleAdd} style={{ borderRadius: "6px", fontWeight: "600" }}>
          + Add Secretary
        </button>
      </div>

      <div className="table-container">
        <table className="table user-table table-hover align-middle">
          <thead>
            <tr>
              <th className="text-center" style={{ width: "100px", whiteSpace: "nowrap" }}>Sr. No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Building</th>
              <th className="text-center" style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSecretaries.map((sec, index) => (
              <tr key={sec.id || sec.secretary_id}>
                <td className="text-center">{indexOfFirstSecretary + index + 1}</td>
                <td style={{ fontWeight: "500" }}>{sec.sname}</td>
                <td>{sec.semail}</td>
                <td>{sec.building_name || "-"}</td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-3">
                    <FaEdit
                      className="text-primary"
                      style={{ cursor: "pointer", fontSize: "1.2rem" }}
                      onClick={() => handleEdit(sec.id || sec.secretary_id)}
                      title="Edit"
                    />
                    <FaTrash
                      className="text-danger"
                      style={{ cursor: "pointer", fontSize: "1.2rem" }}
                      onClick={() => handleDelete(sec.id || sec.secretary_id)}
                      title="Delete"
                    />
                  </div>
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

export default AdminSecretaries;