import { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";

function NotificationPrompt() {
  const [user, setUser] = useState(null);
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const [showBanner, setShowBanner] = useState(false);
  const lastCountRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Show banner if permission not granted
  useEffect(() => {
    if (!user) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") {
      setShowBanner(true);
    }
  }, [user]);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") {
      alert(
        "Notifications are not supported in this browser.\n\nOn iPhone: Add this site to your Home Screen first, then open it from there."
      );
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        setShowBanner(false);
        new Notification("Notifications Enabled ✅", {
          body: "You'll now get alerts for new chats.",
          icon: "/logo.png",
        });
      } else if (result === "denied") {
        alert(
          "Permission denied. Please enable notifications in your browser settings."
        );
      }
    } catch (err) {
      console.error("Permission error:", err);
      alert("Could not request permission: " + err.message);
    }
  };

  // LIVE NOTIFICATIONS
  useEffect(() => {
    if (!user || permission !== "granted") return;

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      where("read", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      const count = snap.size;

      if (!initializedRef.current) {
        lastCountRef.current = count;
        initializedRef.current = true;
        return;
      }

      if (count > lastCountRef.current) {
        const newest = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const getT = (t) => t?.toMillis?.() || (t?.seconds * 1000) || 0;
            return getT(b.createdAt) - getT(a.createdAt);
          })[0];

        if (newest && Notification.permission === "granted") {
          try {
            const n = new Notification(newest.title || "New Notification", {
              body: newest.message || "",
              icon: "/logo.png",
              badge: "/logo.png",
              tag: newest.id,
            });

            n.onclick = () => {
              window.focus();
              if (newest.type === "chat" && newest.chatId) {
                window.location.hash = `#/chat/${newest.chatId}`;
              } else if (newest.adId) {
                window.location.hash = `#/ad/${newest.adId}`;
              }
              n.close();
            };
          } catch (err) {
            console.error("Display error:", err);
          }
        }
      }

      lastCountRef.current = count;
    });

    return () => unsub();
  }, [user, permission]);

  if (!showBanner) return null;

  return (
    <div className="notif-prompt-banner">
      <div className="notif-prompt-text">
        🔔 <strong>Enable notifications</strong>
        <span>Get alerts when someone messages you</span>
      </div>
      <div className="notif-prompt-actions">
        <button onClick={requestPermission} className="notif-enable-btn">
          Enable
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="notif-dismiss-btn"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default NotificationPrompt;
