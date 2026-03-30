import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null); // currently marking notification

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const adminId = storedUser?.id;

      const res = await axios.get("http://localhost:5000/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const adminNotifs = res.data.filter(
        (n) => n.receiver_type === "admin" && n.receiver_id === adminId
      );

      setNotifications(adminNotifs);
      const unread = adminNotifs.filter((n) => n.is_read === 0).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      setMarking(id);
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      setMarking(null);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading)
    return <p className="text-center mt-5">Loading notifications...</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        Notifications{" "}
        <span className="badge bg-danger">{unreadCount}</span>
      </h2>

      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <div className="list-group">
          {notifications.map((n) => (
            <div
              key={n.notification_id}
              className={`list-group-item d-flex justify-content-between align-items-start ${
                n.is_read ? "bg-light text-muted" : "bg-white shadow-sm"
              }`}
            >
              <div className="ms-2 me-auto">
                <div
                  className={`fw-semibold ${
                    n.is_read ? "text-muted" : ""
                  }`}
                >
                  {n.message}
                </div>
                {n.building_name && (
                  <small className="text-primary d-block">
                    Building: {n.building_name}
                  </small>
                )}
                <small className="text-secondary">
                  {new Date(n.created_at).toLocaleString()}
                </small>
              </div>

              {!n.is_read && (
                <button
                  className={`btn btn-outline-success btn-sm d-flex align-items-center gap-1 ${
                    marking === n.notification_id
                      ? "disabled opacity-50"
                      : ""
                  }`}
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

export default AdminNotifications;