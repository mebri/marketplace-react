import { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";

function NotificationPrompt() {
  const [user, setUser] = useState(null);
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [showBanner, setShowBanner] = useState(false);
  const lastCountRef = useRef(0);
  const initializedRef = useRef(false);

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Show banner if permission not decided
  useEffect(() => {
    if (!user) return;
    if (permission === "default") {
      const dismissed = sessionStorage.getItem("notif-banner-dismissed");
      if (!dismissed) setShowBanner(true);
    }
  }, [user, permission]);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowBanner(false);
      if (result === "granted") {
        new Notification("Notifications Enabled ✅", {
          body: "You'll now get alerts for new chats and messages.",
          icon: "/logo.png",
        });
      }
    } catch (err) {
      console.error("Permission error:", err);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem("notif-banner-dismissed", "1");
  };

  // LISTEN FOR NEW NOTIFICATIONS AND SHOW THEM
  useEffect(() => {
    if (!user || permission !== "granted") return;

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      where("read", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      const count = snap.size;

      // Initialize on first load (don't spam old notifications)
      if (!initializedRef.current) {
        lastCountRef.current = count;
        initializedRef.current = true;
        return;
      }

      // Only fire when count increases
      if (count > lastCountRef.current) {
        const newest = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const getT = (t) =>
              t?.toMillis?.() || (t?.seconds * 1000) || 0;
            return getT(b.createdAt) - getT(a.createdAt);
          })[0];

        if (newest && Notification.permission === "granted") {
          try {
            const n = new Notification(newest.title || "New Notification", {
              body: newest.message || "",
              icon: "/logo.png",
              badge: "/logo.png",
              tag: newest.id, // prevents duplicate notifications
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
            console.error("Notification display error:", err);
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
        <button onClick={dismissBanner} className="notif-dismiss-btn">
          ✕
        </button>
      </div>
    </div>
  );
}

export default NotificationPrompt;
