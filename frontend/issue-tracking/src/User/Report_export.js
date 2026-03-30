import React, { useState } from "react";
import axios from "axios";

const UserReports = () => {
  const [format, setFormat] = useState("excel");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleExport = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      // Build query params
      const params = { format };
      if (status) params.status = status;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const res = await axios.get("http://localhost:5000/user/export-issues", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
        params,
      });

      const fileName =
        format === "csv" ? "user_issues_report.csv" : "user_issues_report.xlsx";

      // Download the file
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage("✅ Report exported successfully!");
    } catch (err) {
      console.error("Export error:", err);
      setMessage("❌ Failed to export report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="text-center mb-4">📊 Export My Issues (User)</h2>

        {/* Success / error message */}
        {message && (
          <div
            className={`alert ${
              message.startsWith("✅") ? "alert-success" : "alert-danger"
            } text-center`}
          >
            {message}
          </div>
        )}

        <div className="row g-3">
          {/* Status filter */}
          <div className="col-md-6">
            <label className="form-label fw-bold">⚡ Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">-- All --</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* From date */}
          <div className="col-md-6">
            <label className="form-label fw-bold">📅 From Date</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* To date */}
          <div className="col-md-6">
            <label className="form-label fw-bold">📅 To Date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Format selector */}
          <div className="col-md-6">
            <label className="form-label fw-bold">📂 Export Format</label>
            <select
              className="form-select"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
            </select>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            className="btn btn-primary px-4 py-2"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? "⏳ Exporting..." : "⬇️ Export Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserReports;