import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminReports = () => {
  const [format, setFormat] = useState("csv");
  const [status, setStatus] = useState("");
  const [building, setBuilding] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/buildings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBuildings(res.data);
      } catch (err) {
        console.error("Error fetching buildings:", err);
      }
    };

    fetchBuildings();
  }, []);

  const handleExport = async () => {
    if (!building && !status && !fromDate && !toDate) {
      alert("Please select at least one filter to export");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/admin/export-issues", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
        params: {
          format,
          status,
          building_name: building,
          from: fromDate,
          to: toDate,
        },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "admin_issues_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export report. Please check your selections.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="text-center mb-4">📊 Export Issues Report</h2>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">🏢 Building Name</label>
            <select
              className="form-select"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
            >
              <option value="">-- All Buildings --</option>
              {buildings.map((b, index) => (
                <option key={index} value={b.building_name}>
                  {b.building_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">⚡ Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">-- All --</option>
              <option value="in process">In Process</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">📅 From Date</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">📅 To Date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">📂 Export Format</label>
            <select
              className="form-select"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="csv">CSV (.csv)</option>
            </select>
          </div>
        </div>
        <div className="text-center mt-4">
          <button className="btn btn-success px-4 py-2" onClick={handleExport}>
            ⬇️ Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;