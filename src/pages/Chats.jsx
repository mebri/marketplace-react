import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";

function Chats() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort by updatedAt (newest first)
      list.sort((a, b) => {
        const getTime = (t) => {
          if (!t) return 0;
          if (t.toMillis) return t.toMillis();
          if (t.seconds) return t.seconds * 1000;
          return new Date(t).getTime();
        };
        return getTime(b.updatedAt) - getTime(a.updatedAt);
      });

      setChats(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <div className="chats-page">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-required">
        <div className="login-required-icon">🔒</div>
        <h1>Please Log In</h1>
        <Link to="/login" className="dashboard-primary-btn">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="chats-page">
      <h1>💬 My Chats</h1>
      {chats.length === 0 ? (
        <div className="chats-empty">
          <h3>No conversations yet</h3>
          <p>When you contact a seller, your chats will appear here.</p>
        </div>
      ) : (
        <div className="chats-list">
          {chats.map((chat) => {
            const otherId = chat.participants.find((id) => id !== user.uid);
            const isBuyer = chat.buyerId === user.uid;
            const otherName = isBuyer ? chat.sellerName : chat.buyerName;

            return (
              <Link to={`/chat/${chat.id}`} key={chat.id} className="chat-item">
                <div className="chat-item-avatar">
                  {(otherName || "U").charAt(0).toUpperCase()}
                </div>
                <div className="chat-item-info">
                  <h3>{otherName || "User"}</h3>
                  <p>{chat.lastMessage || `About: ${chat.adTitle || "Advertisement"}`}</p>
                </div>
                <div className="chat-item-time">{formatTime(chat.updatedAt)}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Chats;
