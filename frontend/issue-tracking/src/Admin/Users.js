import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./AdminTable.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedUsers = Array.isArray(res.data)
        ? res.data
        : res.data.users || [];
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  if (loading) return <div className="text-center mt-4">Loading users...</div>;
  if (error) return <div className="text-danger text-center mt-4">{error}</div>;

  return (
    <div className="user-table-wrapper">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      
      <div className="d-flex justify-content-between align-items-center mb-4 w-100">
        <h2 className="m-0">Users</h2>
        <button
          className="btn btn-primary px-4 py-2"
          onClick={() => navigate("/admin/users/add")}
          style={{ borderRadius: "6px", fontWeight: "600" }}
        >
          Add New User
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
            {currentUsers.map((user, index) => (
              <tr key={user.id || user.user_id}>
                <td className="text-center">{indexOfFirstUser + index + 1}</td>
                <td style={{ fontWeight: "500" }}>{user.name || user.uname || "-"}</td>
                <td>{user.email || user.uemail || "-"}</td>
                <td>
                  {user.building_name ? user.building_name : "-"}
                  {user.house_no ? ` - ${user.house_no}` : ""}
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-3">
                    <FaEdit
                      className="text-warning"
                      style={{ cursor: "pointer", fontSize: "1.2rem" }}
                      onClick={() =>
                        navigate(`/admin/users/edit/${user.user_id || user.id}`)
                      }
                      title="Edit"
                    />
                    <FaTrash
                      className="text-danger"
                      style={{ cursor: "pointer", fontSize: "1.2rem" }}
                      onClick={() => handleDelete(user.user_id || user.id)}
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

export default AdminUsers;