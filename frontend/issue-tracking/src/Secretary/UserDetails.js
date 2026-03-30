import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./SecretaryTable.css"; // Custom CSS for secretary table

const SecretaryUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not logged in. Please login first.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/secretary/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error(err.response?.data?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  // Pagination logic
  const totalRecords = users.length;
  const totalPages = Math.ceil(totalRecords / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  return (
    <div className="container-fluid px-4 mt-4">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0">Users</h2>
        <button
          className="btn btn-success px-4 py-2"
          onClick={() => navigate("/secretary/users/add")}
        >
          + Add User
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-center">No users found in your building.</p>
      ) : (
        <div className="table-responsive">
          {/* Add User Button */}


          <table className="table table-bordered table-hover">
            <thead>
              <tr className="table-light text-dark">
                <th style={{ width: "100px", whiteSpace: "nowrap" }}>Sr. No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>House No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={user.user_id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{user.uname || "-"}</td>
                  <td>{user.uemail || "-"}</td>
                  <td>{user.house_no || "-"}</td>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <FaEdit
                        className="text-primary"
                        style={{ cursor: "pointer", fontSize: "1.2rem" }}
                        onClick={() =>
                          navigate(`/secretary/users/edit/${user.user_id}`)
                        }
                        title="Edit"
                      />
                      <FaTrash
                        className="text-danger"
                        style={{ cursor: "pointer", fontSize: "1.2rem" }}
                        onClick={() => handleDelete(user.user_id)}
                        title="Delete"
                      />
                    </div>
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
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
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

export default SecretaryUsers;