
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

function Notifications() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    // NO orderBy here — sort in JavaScript instead
    const ref = collection(db, "users", user.uid, "notifications");

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Sort newest first
        list.sort((a, b) => {
          const getTime = (t) => {
            if (!t) return 0;
            if (t.toMillis) return t.toMillis();
            if (t.seconds) return t.seconds * 1000;
            return new Date(t).getTime();
          };
          return getTime(b.createdAt) - getTime(a.createdAt);
        });

        setNotifications(list);
        setLoading(false);
      },
      (err) => {
        console.error("Notification listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const formatTime = (ts) => {
    if (!ts) return "";
    let date;
    if (ts.toDate) date = ts.toDate();
    else if (ts.seconds) date = new Date(ts.seconds * 1000);
    else date = new Date(ts);

    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  const handleNotificationClick = async (notif) => {
    try {
      await updateDoc(
        doc(db, "users", user.uid, "notifications", notif.id),
        { read: true }
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }

    if (notif.type === "chat" && notif.chatId) {
      navigate(`/chat/${notif.chatId}`);
    } else if (notif.adId) {
      navigate(`/ad/${notif.adId}`);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications
        .filter((n) => !n.read)
        .forEach((n) => {
          const ref = doc(db, "users", user.uid, "notifications", n.id);
          batch.update(ref, { read: true });
        });
      await batch.commit();
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const deleteNotification = async (e, notifId) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await deleteDoc(doc(db, "users", user.uid, "notifications", notifId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const clearAll = async () => {
    if (!window.confirm("Delete all notifications?")) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        const ref = doc(db, "users", user.uid, "notifications", n.id);
        batch.delete(ref);
      });
      await batch.commit();
    } catch (err) {
      console.error("Clear all error:", err);
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-required">
        <div className="login-required-icon">🔒</div>
        <h1>Please Log In</h1>
        <Link to="/login" className="dashboard-primary-btn">
          Go to Login
        </Link>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>🔔 Notifications</h1>
        {notifications.length > 0 && (
          <div className="notifications-actions">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-btn">
                Mark all read
              </button>
            )}
            <button onClick={clearAll} className="clear-all-btn">
              Clear all
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 15 }}>
          Error: {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="notifications-empty">
          <div className="empty-bell">🔕</div>
          <h3>No notifications yet</h3>
          <p>You'll see updates about your ads and chats here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${notif.read ? "" : "unread"}`}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="notification-icon">
                {notif.type === "chat" ? "💬" : "🔔"}
              </div>

              <div className="notification-content">
                <h4>{notif.title || "Notification"}</h4>
                <p>{notif.message || ""}</p>
                <span className="notification-time">
                  {formatTime(notif.createdAt)}
                </span>
              </div>

              <button
                className="notification-delete"
                onClick={(e) => deleteNotification(e, notif.id)}
                aria-label="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
