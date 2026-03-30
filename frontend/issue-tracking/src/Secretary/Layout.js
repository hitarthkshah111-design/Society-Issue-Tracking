import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBug,
  FaComments,
  FaFileAlt,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const SecretaryLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: "Secretary", avatar: null });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser({
        name: storedUser.name || "Secretary",
        building_name: storedUser.building_name || "",
        avatar: storedUser.avatar || null,
      });
    }
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/notifications/unread/count",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const links = [
    { path: "/secretary", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/secretary/profile", label: "Profile", icon: <FaUserCircle /> },
    { path: "/secretary/users", label: "User Details", icon: <FaUsers /> },
    { path: "/secretary/issues", label: "Issues", icon: <FaBug /> },
    { path: "/secretary/feedback", label: "Feedback", icon: <FaComments /> },
    { path: "/secretary/reports", label: "Reports", icon: <FaFileAlt /> },
    { path: "/secretary/notifications", label: "Notifications", icon: <FaBell /> },
  ];

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <aside
        className="bg-dark text-white d-flex flex-column p-0 shadow-lg"
        style={{
          width: "230px",
          position: "fixed",
          height: "100%",
          left: 0,
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Sidebar Header with background image */}
        <div
          className="text-center p-4 border-bottom d-flex flex-column justify-content-center"
          style={{
            backgroundImage: "url('/background image.jpg')", // ✅ ensure this image is in /public folder
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "160px",
            position: "relative",
            color: "white",
          }}
        >
          {/* Overlay for better readability */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.55)",
              zIndex: 1,
            }}
          ></div>
      
          {/* Text Content */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <h6 className="fw-bold mb-1">{user.building_name}</h6>
            <p className="mb-0 text-light">{user.name}</p>
          </div>
        </div>
      
        {/* Navigation Links */}
        <nav className="nav flex-column mt-3 flex-grow-1">
          {links.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link d-flex align-items-center py-3 px-4 transition-all ${
                isActive(item.path)
                  ? "bg-gradient text-white shadow-sm rounded-start"
                  : "text-light"
              }`}
              style={{
                textDecoration: "none",
                background:
                  isActive(item.path) && "linear-gradient(90deg, #4e54c8, #8f94fb)",
                fontWeight: isActive(item.path) ? "600" : "400",
                transition: "all 0.2s ease",
              }}
            >
              <span className="me-2">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{ marginLeft: "230px" }}
      >
        {/* Top Bar */}
        <header
          className="d-flex justify-content-end align-items-center px-4 py-2 shadow-sm sticky-top"
          style={{
            background:
              "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #6B8DD6 100%)",
            color: "#fff",
            zIndex: 5,
          }}
        >
          <div className="d-flex align-items-center">
            {/* Notification Bell */}
<div className="position-relative me-3">
  <button
    className="btn btn-light shadow-sm"
    onClick={() => navigate("/secretary/notifications")}
    style={{
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      padding: "0",
      transition: "0.3s ease",
    }}
    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    <FaBell size={20} />
  </button>

  {/* Red Dot above the bell */}
  {unreadCount > 0 && (
    <span
      style={{
        width: "10px",
        height: "10px",
        backgroundColor: "red",
        borderRadius: "50%",
        position: "absolute",
        top: "-5px",   // above the bell
        right: "0",     // align to right
        display: "inline-block",
      }}
    ></span>
  )}
</div>
            {/* User Info */}
            <div className="d-flex align-items-center me-3 text-white fw-semibold">
              <FaUserCircle size={22} className="me-1" />
              <span>{user.name}</span>
            </div>

            {/* Logout */}
            <button
              className="btn btn-outline-light d-flex align-items-center shadow-sm"
              onClick={handleLogout}
              style={{ borderRadius: "30px", transition: "0.3s ease" }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#fff";
                e.currentTarget.style.color = "#764ba2";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#fff";
              }}
            >
              <FaSignOutAlt className="me-1" /> Logout
            </button>
          </div>
        </header>

        <main
          className="flex-grow-1 bg-light p-4 overflow-auto"
          style={{ minHeight: "calc(100vh - 56px)", backgroundColor: "#f8f9fa" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SecretaryLayout;