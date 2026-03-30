import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch user info
  useEffect(() => {
    if (!token) return;
    axios.get("http://localhost:5000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setUser(res.data))
    .catch((err) => console.error("Auth error:", err));
  }, [token]);

  // Fetch issues
  useEffect(() => {
    if (!user) return;
    axios.get("http://localhost:5000/issues", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const issuesArray = Array.isArray(res.data) ? res.data : res.data.issues || [];
      setIssues(issuesArray);
    })
    .catch((err) => {
      console.error("Issues fetch error:", err);
      alert("Failed to load data: " + (err.response?.data?.message || err.message));
    })
    .finally(() => setLoading(false));
  }, [user, token]);

  if (!user) return <p className="text-center mt-5">Please log in...</p>;
  if (loading) return <p className="text-center mt-5">Loading your issues...</p>;

  // Calculate status counts
  const total = issues.length;
  const pending = issues.filter((i) => i.status === "Pending").length;
  const inProgress = issues.filter((i) => i.status === "In Progress").length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;

  const statusData = [
    { name: "Pending", value: pending },
    { name: "In Progress", value: inProgress },
    { name: "Resolved", value: resolved },
  ];

  const statusColors = ["#FF8042", "#0088FE", "#00C49F"];

  // Compute category counts dynamically
  const categoryCounts = issues.reduce((acc, i) => {
    if (i.category === "Personal") acc.personal += 1;
    else  acc.general += 1;
    return acc;
  }, { personal: 0, general: 0});

  const categoryData = [
    { name: "Personal", value: categoryCounts.personal },
    { name: "General", value: categoryCounts.general },
  ];

  const categoryColors = ["#FFBB28", "#00C49F"];
  const renderLegend = () => {
    return (
      <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
        {statusData.map((item, index) => (
          <div
            key={item.name}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                background: statusColors[index],
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 13 }}>{item.name}</span>
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="container mt-4">
      <h1 className="mb-3">User Dashboard</h1>
      <h4 className="mb-4">Welcome, {user.name}!</h4>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Total Issues</h5>
              <p className="card-text display-6">{total}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <p className="card-text display-6">{pending}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center text-white" style={{ backgroundColor: "#6f42c1" }}>
            <div className="card-body">
              <h5 className="card-title">In Progress</h5>
              <p className="card-text display-6">{inProgress}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Resolved</h5>
              <p className="card-text display-6">{resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        {/* Status Bar Chart */}
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-center mb-3">Issues by Status</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" content={renderLegend} />
                  <Bar dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-center mb-3">Issues by Category</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value, percent }) => `${name} (${value}, ${(percent*100).toFixed(0)}%)`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-category-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;