import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SecretaryIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const issuesPerPage = 10;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/issues", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIssues(res.data.issues || []);
      } catch (err) {
        console.error("Failed to fetch issues:", err);
        alert("Failed to fetch issues");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [token]);

  // Pagination logic
  const totalRecords = issues.length;
  const totalPages = Math.ceil(totalRecords / issuesPerPage);
  const startIndex = (currentPage - 1) * issuesPerPage;
  const endIndex = startIndex + issuesPerPage;
  const currentIssues = issues.slice(startIndex, endIndex);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p className="text-center mt-5">Loading issues...</p>;
  if (!issues.length)
    return <p className="text-center mt-5">No issues found for your building.</p>;

  return (
    <div className="container-fluid px-4 mt-4">
      <h2 className="mb-4">📋 Issues in Your Building</h2>

      <div className="table-responsive">
        <table className="table table-bordered table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "100px", whiteSpace: "nowrap" }}>Sr. No.</th>
                <th>Title</th>
                <th>Reporter</th>
                <th>Status</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentIssues.map((issue, index) => (
                <tr key={issue.issue_id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{issue.title}</td>
                  <td>{issue.reporter_name}</td>
                  <td>{issue.status}</td>
                  <td>{issue.category}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        navigate(`/secretary/issues/update/${issue.issue_id}`)
                      }
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-3">
          <ul className="pagination pagination-sm mb-0">
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
  );
};

export default SecretaryIssues;