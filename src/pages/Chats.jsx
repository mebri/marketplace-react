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
      list.sort((a, b) => {
        const aT = a.lastMessageAt?.toMillis?.() || (a.lastMessageAt?.seconds * 1000) || 0;
        const bT = b.lastMessageAt?.toMillis?.() || (b.lastMessageAt?.seconds * 1000) || 0;
        return bT - aT;
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

  if (loading) return <div className="chats-page"><h1>Loading...</h1></div>;

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
            const otherName = chat.participantNames?.[otherId] || "User";
            return (
              <Link to={`/chat/${chat.id}`} key={chat.id} className="chat-item">
                <div className="chat-item-avatar">
                  {otherName.charAt(0).toUpperCase()}
                </div>
                <div className="chat-item-info">
                  <h3>{otherName}</h3>
                  <p>{chat.lastMessage || "Start a conversation"}</p>
                </div>
                <div className="chat-item-time">{formatTime(chat.lastMessageAt)}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Chats;
