// src/pages/SecretaryNotifications.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBell, FaCheckCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const SecretaryNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const secretaryNotifs = res.data;
      setNotifications(secretaryNotifs);
      setUnreadCount(secretaryNotifs.filter((n) => n.is_read === 0).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const markAsRead = async (id) => {
    try {
      setMarking(id);
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `http://localhost:5000/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, is_read: 1 } : n))
      );

      if (res.data.unreadCount !== undefined) {
        setUnreadCount(res.data.unreadCount);
      } else {
        setUnreadCount((prev) => prev - 1);
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    } finally {
      setMarking(null);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading notifications...</p>;

  // Sort: unread first
  const sortedNotifications = [...notifications].sort((a, b) => a.is_read - b.is_read);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 d-flex align-items-center gap-2">
        <FaBell /> Notifications ({unreadCount} Unread)
      </h2>

      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <div className="list-group">
          {sortedNotifications.map((n) => (
            <div
              key={n.notification_id}
              className={`list-group-item d-flex justify-content-between align-items-start ${
                n.is_read ? "bg-light" : "bg-warning"
              }`}
            >
              <div className="ms-2 me-auto">
                <div className={`fw-bold ${n.is_read ? "text-muted" : ""}`}>
                  {n.message}
                </div>
                {n.building_name && (
                  <small className="text-primary d-block">
                    Building: {n.building_name}
                  </small>
                )}
                <small className="text-muted">
                  {new Date(n.created_at).toLocaleString()}
                </small>
              </div>

              {!n.is_read && (
                <button
                  className="btn btn-success btn-sm d-flex align-items-center gap-1"
                  disabled={marking === n.notification_id}
                  onClick={() => markAsRead(n.notification_id)}
                >
                  <FaCheckCircle />
                  {marking === n.notification_id ? "Marking..." : "Mark as Read"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecretaryNotifications;