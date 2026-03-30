import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, Bell } from "lucide-react";

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null); // track marking read

  // Fetch only notifications for the logged-in user
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) return;

      const res = await axios.get("http://localhost:5000/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter explicitly by user ID to be safe
      const userNotifs = res.data
        .filter((n) => n.receiver_type === "user" && n.receiver_id === storedUser.id)
        .sort((a, b) => a.is_read - b.is_read || new Date(b.created_at) - new Date(a.created_at)); 
      // unread first, then newest

      setNotifications(userNotifs);

      const unread = userNotifs.filter((n) => n.is_read === 0).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
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
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    } finally {
      setMarking(null);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center mt-5">Loading notifications...</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3 d-flex align-items-center gap-2">
        <Bell /> My Notifications ({unreadCount} Unread)
      </h2>

      {notifications.length === 0 ? (
        <p className="text-center">No notifications found.</p>
      ) : (
        <ul className="list-group">
          {notifications.map((n, idx) => (
            <li
              key={n.notification_id}
              className={`list-group-item d-flex justify-content-between align-items-start mb-2 rounded ${
                n.is_read ? "bg-light" : "bg-warning"
              }`}
            >
              <div>
                <div className={`fw-bold ${n.is_read ? "text-secondary" : ""}`}>
                  {n.message}
                </div>
                {n.building_name && (
                  <div className="text-primary small">Building: {n.building_name}</div>
                )}
                <div className="text-muted small">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => markAsRead(n.notification_id)}
                  disabled={marking === n.notification_id}
                  className={`btn btn-sm btn-success d-flex align-items-center gap-1 ${
                    marking === n.notification_id ? "disabled" : ""
                  }`}
                >
                  <CheckCircle size={16} /> {marking === n.notification_id ? "Marking..." : "Mark as Read"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserNotifications;