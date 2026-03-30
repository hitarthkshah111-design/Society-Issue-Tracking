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
  Cell
} from "recharts";

const SecretaryDashboard = () => {
  const [dashboard, setDashboard] = useState({
    buildingName: "",
    stats: { total: 0, pending: 0, inProgress: 0, resolved: 0 },
    issues: [],
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/secretary/dashboard-data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboard({
          buildingName: res.data.buildingName || "",
          stats: res.data.stats || { total: 0, pending: 0, inProgress: 0, resolved: 0 },
          issues: res.data.issues || [],
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        alert("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  const {stats, issues } = dashboard;

// Use stats from the fetched dashboard
const statusData = [
  { name: "Pending", value: stats.pending || 0 },
  { name: "In Progress", value: stats.inProgress || 0 },
  { name: "Resolved", value: stats.resolved || 0 },
];

const statusColors = ["#FF8042", "#0088FE", "#00C49F"];

// Compute category counts dynamically from issues
const categoryCountMap = issues.reduce((acc, issue) => {
  acc[issue.category] = (acc[issue.category] || 0) + 1;
  return acc;
}, {});

const categoryData = Object.entries(categoryCountMap).map(([name, value]) => ({
  name,
  value,
}));

const categoryColors = ["#FFBB28", "#00C49F"];

const renderLegend = () => (
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
            background: statusColors[index % statusColors.length],
            borderRadius: 2,
          }}
        />
        <span style={{ fontSize: 13 }}>{item.name}</span>
      </div>
    ))}
  </div>
);

  return (
    <div className="container mt-4">
      <h1 className="mb-3">Dashboard </h1>
      {/* Status Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Issues</h5>
              <p className="card-text display-6">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <p className="card-text display-6">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center text-white" style={{ backgroundColor: "#fd7e14" }}>
            <div className="card-body">
              <h5 className="card-title">In Progress</h5>
              <p className="card-text display-6">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Resolved</h5>
              <p className="card-text display-6">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
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
      {statusData.map((item, index) => (
        <Cell key={`cell-status-${index}`} fill={statusColors[index % statusColors.length]} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
            </div>
          </div>
        </div>

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
      label={({ name, value, percent }) =>
        `${name} (${value}, ${(percent * 100).toFixed(0)}%)`
      }
    >
      {categoryData.map((_, index) => (
        <Cell
          key={`cell-category-${index}`}
          fill={categoryColors[index % categoryColors.length]}
        />
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

export default SecretaryDashboard;