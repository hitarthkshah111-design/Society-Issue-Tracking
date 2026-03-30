import React, { useState } from "react";
import axios from "axios";

const SecretaryReports = () => {
  const [format, setFormat] = useState("csv"); // default to CSV
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/secretary/export-issues", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
        params: {
          format,
          status: status || undefined, // only send if selected
          from: fromDate || undefined,
          to: toDate || undefined,
        },
      });

      const fileName =
        format === "csv"
          ? "secretary_issues_report.csv"
          : "secretary_issues_report.xlsx";

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
      alert("❌ Failed to export report");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="text-center mb-4">📊 Export Issues Report (Secretary)</h2>

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
              <option value="csv">CSV (.csv)</option>
              <option value="excel">Excel (.xlsx)</option>
            </select>
          </div>
        </div>

        <div className="text-center mt-4">
          <button className="btn btn-primary px-4 py-2" onClick={handleExport}>
            ⬇️ Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryReports;