import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc, onSnapshot, collection, query, orderBy,
  addDoc, updateDoc, serverTimestamp
} from "firebase/firestore";

function ChatRoom() {
  const { chatId } = useParams();
  const [user, setUser] = useState(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!chatId) return;
    const unsub = onSnapshot(doc(db, "chats", chatId), (snap) => {
      if (snap.exists()) setChat({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user || !chatId) return;
    const msg = text.trim();
    setText("");
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId: user.uid,
      senderName: user.displayName || user.email || "User",
      text: msg,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: msg,
      lastMessageAt: serverTimestamp(),
    });
  };

  if (loading) return <div className="chat-room-page"><p>Loading...</p></div>;
  if (!user) return <div className="chat-room-page"><p>Please log in.</p></div>;
  if (!chat) return <div className="chat-room-page"><p>Chat not found.</p></div>;

  const otherId = chat.participants.find((id) => id !== user.uid);
  const otherName = chat.participantNames?.[otherId] || "User";

  return (
    <div className="chat-room-page">
      <div className="chat-room-header">
        <Link to="/chats" className="chat-back">←</Link>
        <h2>{otherName}</h2>
      </div>

      {chat.adTitle && (
        <div className="chat-ad-banner">📢 {chat.adTitle}</div>
      )}

      <div className="chat-room-messages">
        {messages.length === 0 && (
          <p className="chat-no-messages">No messages yet. Say hello! 👋</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble ${msg.senderId === user.uid ? "mine" : "theirs"}`}
          >
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-room-input" onSubmit={sendMessage}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatRoom;
