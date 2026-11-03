import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

import "./Chat.css";

function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const currentUser = auth.currentUser;

  // =========================================
  // LOAD CHAT
  // =========================================

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!chatId) {
      navigate("/");
      return;
    }

    const loadChat = async () => {
      try {
        const chatRef = doc(
          db,
          "chats",
          chatId
        );

        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
          alert("Chat not found.");
          navigate("/");
          return;
        }

        const chatData = {
          id: chatSnap.id,
          ...chatSnap.data(),
        };

        // Make sure this user belongs to the chat
        if (
          !chatData.participants?.includes(
            currentUser.uid
          )
        ) {
          alert(
            "You are not allowed to open this chat."
          );

          navigate("/");
          return;
        }

        setChat(chatData);
        setLoading(false);
      } catch (error) {
        console.error(
          "Error loading chat:",
          error
        );

        alert(
          error.message ||
            "Could not load chat."
        );

        navigate("/");
      }
    };

    loadChat();
  }, [chatId, navigate, currentUser]);


  // =========================================
  // LISTEN FOR MESSAGES
  // =========================================

  useEffect(() => {
    if (!chatId || !currentUser) {
      return;
    }

    const messagesRef = collection(
      db,
      "chats",
      chatId,
      "messages"
    );

    const messagesQuery = query(
      messagesRef,
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messageList =
          snapshot.docs.map(
            (messageDoc) => ({
              id: messageDoc.id,
              ...messageDoc.data(),
            })
          );

        setMessages(messageList);
      },
      (error) => {
        console.error(
          "Messages listener error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [chatId, currentUser]);


  // =========================================
  // SEND MESSAGE
  // =========================================

  const sendMessage = async (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text) {
      return;
    }

    if (!currentUser) {
      alert("Please log in.");
      navigate("/login");
      return;
    }

    if (!chat) {
      return;
    }

    try {
      setSending(true);

      const buyerId = chat.buyerId;
      const sellerId = chat.sellerId;

      const receiverId =
        currentUser.uid === buyerId
          ? sellerId
          : buyerId;

      const senderName =
        currentUser.displayName ||
        currentUser.email?.split("@")[0] ||
        "User";

      // =====================================
      // ADD MESSAGE
      // =====================================

      await addDoc(
        collection(
          db,
          "chats",
          chatId,
          "messages"
        ),
        {
          text,

          senderId:
            currentUser.uid,

          senderName,

          receiverId,

          createdAt:
            serverTimestamp(),

          read: false,
        }
      );

      // =====================================
      // UPDATE CHAT
      // =====================================

      await updateDoc(
        doc(db, "chats", chatId),
        {
          lastMessage: text,

          lastMessageSenderId:
            currentUser.uid,

          updatedAt:
            serverTimestamp(),
        }
      );

      // =====================================
      // NOTIFICATION
      // =====================================

      await addDoc(
        collection(
          db,
          "users",
          receiverId,
          "notifications"
        ),
        {
          type: "chat",

          title:
            `New message from ${senderName}`,

          message: text,

          chatId,

          adId:
            chat.adId || "",

          fromUserId:
            currentUser.uid,

          fromUserName:
            senderName,

          read: false,

          createdAt:
            serverTimestamp(),
        }
      );

      setMessage("");
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      alert(
        error.message ||
          "Could not send message."
      );
    } finally {
      setSending(false);
    }
  };


  // =========================================
  // ENTER KEY
  // =========================================

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      sendMessage(e);
    }
  };


  // =========================================
  // FORMAT TIME
  // =========================================

  const formatMessageTime = (
    createdAt
  ) => {
    if (!createdAt) {
      return "";
    }

    let date;

    try {
      if (
        typeof createdAt.toDate ===
        "function"
      ) {
        date =
          createdAt.toDate();
      } else if (
        createdAt.seconds !==
        undefined
      ) {
        date = new Date(
          createdAt.seconds * 1000
        );
      } else {
        date =
          new Date(createdAt);
      }

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "";
      }

      return date.toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };


  // =========================================
  // CHAT PARTNER
  // =========================================

  const getPartnerName = () => {
    if (!chat || !currentUser) {
      return "Chat";
    }

    if (
      currentUser.uid ===
      chat.buyerId
    ) {
      return (
        chat.sellerName ||
        "Seller"
      );
    }

    return (
      chat.buyerName ||
      "Buyer"
    );
  };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="chat-page">

        <div className="chat-loading">
          Loading chat...
        </div>

      </div>
    );
  }


  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="chat-page">

      {/* ===================================
          CHAT HEADER
      =================================== */}

      <div className="chat-header">

        <button
          type="button"
          className="chat-back-button"
          onClick={() =>
            navigate(-1)
          }
        >
          ←
        </button>

        <div className="chat-person-avatar">
          {getPartnerName()
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="chat-header-info">

          <h2>
            {getPartnerName()}
          </h2>

          <p>
            {chat?.adTitle ||
              "Advertisement"}
          </p>

        </div>

      </div>


      {/* ===================================
          ADVERTISEMENT INFO
      =================================== */}

      {chat?.adTitle && (

        <div className="chat-ad-info">

          {chat.adImage && (
            <img
              src={chat.adImage}
              alt={chat.adTitle}
            />
          )}

          <div>

            <strong>
              {chat.adTitle}
            </strong>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/ad/${chat.adId}`
                )
              }
            >
              View Advertisement
            </button>

          </div>

        </div>

      )}


      {/* ===================================
          MESSAGES
      =================================== */}

      <div className="chat-messages">

        {messages.length === 0 ? (

          <div className="chat-empty">

            <div className="chat-empty-icon">
              💬
            </div>

            <h3>
              Start the conversation
            </h3>

            <p>
              Send a message to
              {getPartnerName()}.
            </p>

          </div>

        ) : (

          messages.map(
            (item) => {

              const mine =
                item.senderId ===
                currentUser?.uid;

              return (

                <div
                  key={item.id}
                  className={`chat-message-row ${
                    mine
                      ? "mine"
                      : "theirs"
                  }`}
                >

                  <div
                    className={`chat-message-bubble ${
                      mine
                        ? "mine"
                        : "theirs"
                    }`}
                  >

                    <div className="chat-message-text">
                      {item.text}
                    </div>

                    <div className="chat-message-time">
                      {formatMessageTime(
                        item.createdAt
                      )}
                    </div>

                  </div>

                </div>

              );
            }
          )

        )}

      </div>


      {/* ===================================
          MESSAGE INPUT
      =================================== */}

      <form
        className="chat-input-area"
        onSubmit={sendMessage}
      >

        <textarea
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder="Write a message..."
          rows="1"
          disabled={sending}
        />

        <button
          type="submit"
          disabled={
            sending ||
            !message.trim()
          }
        >
          {sending
            ? "..."
            : "➤"}
        </button>

      </form>

    </div>
  );
}

export default Chat;