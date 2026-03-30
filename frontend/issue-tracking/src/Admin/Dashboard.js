import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [issues, setIssues] = useState([]);
  const [statusStats, setStatusStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [categoryStats, setCategoryStats] = useState({ personal: 0, general: 0 });

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      setLoading(false);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const res = await axios.get("http://localhost:5000/issues", config);
      const data = res.data;

      setIssues(data.issues || []);
      setCategoryStats(data.categoryStats || { personal: 0, general: 0 });
      setStatusStats(data.statusStats || { total: 0, pending: 0, inProgress: 0, resolved: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 1500000); 
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-center mt-5">Loading dashboard...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  const statusData = [
    { name: "Pending", value: statusStats.pending || 0 },
    { name: "In Progress", value: statusStats.inProgress || 0 },
    { name: "Resolved", value: statusStats.resolved || 0 },
  ];

  const statusColors = ["#FF8042", "#0088FE", "#00C49F"];

  const categoryData = [
    { name: "Personal", value: categoryStats.personal || 0 },
    { name: "General", value: categoryStats.general || 0 },
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
      <h2 className="mb-3">Dashboard</h2>

      {/* Status Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-primary h-100">
            <div className="card-body">
              <h5 className="card-title">Total Issues</h5>
              <p className="card-text fs-4">{statusStats.total}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-warning h-100">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <p className="card-text fs-4">{statusStats.pending}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-info h-100">
            <div className="card-body">
              <h5 className="card-title">In Progress</h5>
              <p className="card-text fs-4">{statusStats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-success h-100">
            <div className="card-body">
              <h5 className="card-title">Resolved</h5>
              <p className="card-text fs-4">{statusStats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row">
        {/* Status BarChart */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-center mb-4">Issues by Status</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" content={renderLegend} />
                  <Bar dataKey="value" fill="#8884d8">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={statusColors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category PieChart */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-center mb-4">Issues by Category</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-category-${index}`} fill={categoryColors[index]} />
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

export default AdminDashboard;