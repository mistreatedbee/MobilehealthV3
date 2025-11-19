import { useEffect, useState } from "react";
import { notificationAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

// Define the Notification type locally if it's not in your types file
interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
}

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await notificationAPI.getForUser(user._id);
        setNotifications(data);
      } catch (err) {
        console.error("Error loading notifications:", err);
        setError("Failed to load notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to mark as read. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Notifications</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Notifications</h1>
        <p className="text-red-500">{error}</p>
        <button
          className="mt-2 text-blue-500 text-sm underline"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-3" role="list">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`p-4 rounded border ${n.read ? "bg-gray-100" : "bg-white shadow-sm"}`}
              role="listitem"
            >
              <div className="font-medium">{n.title}</div>
              <div className="text-sm text-gray-600 mt-1">{n.message}</div>
              {!n.read && (
                <button
                  className="mt-2 text-blue-500 text-sm underline hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => markAsRead(n._id)}
                  aria-label={`Mark notification "${n.title}" as read`}
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
