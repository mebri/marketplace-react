import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
} from "firebase/firestore";

import { db, auth } from "../firebase/firebase";
import ImageLightbox from "../components/ImageLightbox";

function AdDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ad, setAd] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // NEW: Lightbox open state
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // =========================
  // LOAD ADVERTISEMENT
  // =========================
  useEffect(() => {
    loadAd();
  }, [id]);

  const loadAd = async () => {
    try {
      const docRef = doc(db, "ads", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setLoading(false);
        return;
      }

      const adData = { id: docSnap.id, ...docSnap.data() };
      setAd(adData);

      // LOAD SELLER
      if (adData.userId) {
        try {
          const sellerRef = doc(db, "users", adData.userId);
          const sellerSnap = await getDoc(sellerRef);

          if (sellerSnap.exists()) {
            setSeller({ uid: sellerSnap.id, ...sellerSnap.data() });
          } else {
            setSeller({
              uid: adData.userId,
              name: adData.userName || "",
              city: adData.city || "",
            });
          }
        } catch (sellerError) {
          console.error("Seller profile error:", sellerError);
          setSeller({
            uid: adData.userId,
            name: adData.userName || "",
            city: adData.city || "",
          });
        }
      }

      // CHECK FAVORITE
      if (auth.currentUser) {
        const favoriteRef = doc(
          db,
          "users",
          auth.currentUser.uid,
          "favorites",
          id
        );
        const favoriteSnap = await getDoc(favoriteRef);
        setIsFavorite(favoriteSnap.exists());
      }
    } catch (error) {
      console.error("Error loading advertisement:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FAVORITE
  // =========================
  const toggleFavorite = async () => {
    if (!auth.currentUser) {
      alert("Please log in to save advertisements.");
      return;
    }
    if (!ad) return;

    try {
      setFavoriteLoading(true);
      const favoriteRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "favorites",
        id
      );

      if (isFavorite) {
        await deleteDoc(favoriteRef);
        setIsFavorite(false);
        alert("Advertisement removed from favorites.");
      } else {
        await setDoc(favoriteRef, {
          adId: id,
          title: ad.title || "",
          price: ad.price || "",
          city: ad.city || "",
          category: ad.category || "",
          description: ad.description || "",
          image: ad.image || "",
          images: ad.images || [],
          phone: ad.phone || "",
          whatsapp: ad.whatsapp || "",
          telegram: ad.telegram || "",
          userEmail: ad.userEmail || "",
          condition: ad.condition || "",
          type: ad.type || "",
          subcategory: ad.subcategory || "",
          userId: ad.userId || "",
          userName: seller?.name || ad.userName || "",
          savedAt: new Date(),
        });
        setIsFavorite(true);
        alert("Advertisement saved to favorites! ❤️");
      }
    } catch (error) {
      console.error("Favorite error:", error);
      alert(error.message || "Could not save advertisement.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  // =========================
  // CHAT WITH SELLER
  // =========================
  const startChat = async () => {
    if (!auth.currentUser) {
      alert("Please log in to chat with the seller.");
      navigate("/login");
      return;
    }
    if (!ad) return;

    if (ad.userId === auth.currentUser.uid) {
      alert("This is your advertisement. You cannot chat with yourself.");
      return;
    }

    try {
      setChatLoading(true);
      const buyerId = auth.currentUser.uid;
      const sellerId = ad.userId;

      if (!sellerId) {
        alert("Seller information is not available.");
        return;
      }

      const chatId =
        buyerId < sellerId
          ? `${buyerId}_${sellerId}_${id}`
          : `${sellerId}_${buyerId}_${id}`;

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [buyerId, sellerId],
          buyerId,
          sellerId,
          adId: id,
          adTitle: ad.title || "",
          adImage:
            Array.isArray(ad.images) && ad.images.length > 0
              ? ad.images[0]
              : ad.image || "",
          buyerName:
            auth.currentUser.displayName ||
            auth.currentUser.email ||
            "Buyer",
          sellerName: seller?.name || ad.userName || "Seller",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessage: "",
        });

        await addDoc(collection(db, "users", sellerId, "notifications"), {
          type: "chat",
          title: "New chat request 💬",
          message: `${
            auth.currentUser.displayName ||
            auth.currentUser.email ||
            "Someone"
          } wants to chat with you about "${ad.title}".`,
          adId: id,
          chatId,
          fromUserId: buyerId,
          fromUserName:
            auth.currentUser.displayName ||
            auth.currentUser.email ||
            "Buyer",
          read: false,
          createdAt: new Date(),
        });
      }

      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Chat error:", error);
      alert(error.message || "Could not start chat.");
    } finally {
      setChatLoading(false);
    }
  };

  // =========================
  // POSTED TIME
  // =========================
  const getPostedTime = (createdAt) => {
    if (!createdAt) return "";

    let date;
    if (typeof createdAt.toDate === "function") {
      date = createdAt.toDate();
    } else if (typeof createdAt.seconds === "number") {
      date = new Date(
        createdAt.seconds * 1000 +
          Math.floor((createdAt.nanoseconds || 0) / 1000000)
      );
    } else if (createdAt instanceof Date) {
      date = createdAt;
    } else {
      date = new Date(createdAt);
    }

    if (Number.isNaN(date.getTime())) return "";

    const difference = Date.now() - date.getTime();
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (difference < 0 || seconds < 60) return "Just now";
    if (minutes < 60)
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="details-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="details-page">
        <h2>Advertisement not found.</h2>
        <Link to="/">← Back Home</Link>
      </div>
    );
  }

  // =========================
  // IMAGES
  // =========================
  const imageList =
    Array.isArray(ad.images) && ad.images.length > 0
      ? ad.images
      : ad.image
      ? [ad.image]
      : [];

  const nextImage = () => {
    if (imageList.length === 0) return;
    setCurrentImage((current) =>
      current === imageList.length - 1 ? 0 : current + 1
    );
  };

  const previousImage = () => {
    if (imageList.length === 0) return;
    setCurrentImage((current) =>
      current === 0 ? imageList.length - 1 : current - 1
    );
  };

  // =========================
  // CONTACT INFORMATION
  // =========================
  const phoneNumber = ad.phone || "";
  const whatsappNumber = (ad.whatsapp || phoneNumber || "").replace(
    /\D/g,
    ""
  );
  const telegramValue = ad.telegram || "";
  const telegramUsername = telegramValue.trim().replace(/^@/, "");

  // =========================
  // SELLER NAME
  // =========================
  const sellerName = seller?.name || ad.userName || "Seller";
  const sellerCity = seller?.city || ad.city || "";
  const sellerAvatar = sellerName ? sellerName.charAt(0).toUpperCase() : "👤";
  const postedTime = getPostedTime(ad.createdAt);

  const isOwner = ad.userId === auth.currentUser?.uid;

  return (
    <div className="details-page">
      {/* =========================
          MAIN IMAGE
      ========================= */}
      <div className="details-image">
        {imageList.length > 0 ? (
          <>
            <img
              src={imageList[currentImage]}
              alt={ad.title || "Advertisement"}
              className="details-photo"
              onClick={() => setLightboxOpen(true)}
              style={{ cursor: "zoom-in" }}
            />
            {imageList.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-button gallery-prev"
                  onClick={previousImage}
                >
                  ❮
                </button>
                <button
                  type="button"
                  className="gallery-button gallery-next"
                  onClick={nextImage}
                >
                  ❯
                </button>
                <div className="image-counter">
                  {currentImage + 1} / {imageList.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="no-details-image">📷 No Image Available</div>
        )}
      </div>

      {/* =========================
          THUMBNAILS
      ========================= */}
      {imageList.length > 1 && (
        <div className="image-thumbnails">
          {imageList.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${ad.title || "Advertisement"} ${index + 1}`}
              className={
                index === currentImage
                  ? "thumbnail active-thumbnail"
                  : "thumbnail"
              }
              onClick={() => {
                setCurrentImage(index);
                setLightboxOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* =========================
          AD INFORMATION
      ========================= */}
      <div className="details-info">
        {/* POST TIME */}
        {postedTime && (
          <p className="posted-time">🕒 Posted {postedTime}</p>
        )}

        {/* CATEGORY */}
        <span className="details-category">
          {ad.category || "Advertisement"}
        </span>

        {/* TITLE */}
        <h1>{ad.title || "Untitled Advertisement"}</h1>

        {/* PRICE */}
        <h2>
          ETB{" "}
          {Number(String(ad.price || 0).replace(/,/g, "")).toLocaleString(
            "en-US"
          )}
        </h2>

        {/* =========================
            ACTION BUTTONS (SAVE + CHAT IN ONE LINE)
        ========================= */}
        <div className="details-actions-row">
          {/* FAVORITE */}
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            className={`action-btn favorite-action ${
              isFavorite ? "active" : ""
            }`}
          >
            {favoriteLoading
              ? "Saving..."
              : isFavorite
              ? "❤️ Saved"
              : "🤍 Save Ad"}
          </button>

          {/* CHAT WITH SELLER */}
          {!isOwner && (
            <button
              type="button"
              onClick={startChat}
              disabled={chatLoading}
              className="action-btn chat-action"
            >
              {chatLoading ? "Opening..." : "💬 Chat"}
            </button>
          )}
        </div>

        {/* =========================
            DETAILS
        ========================= */}
        {ad.city && (
          <p>
            <strong>📍 City:</strong> {ad.city}
          </p>
        )}

        {ad.condition && (
          <p>
            <strong>🔄 Condition:</strong> {ad.condition}
          </p>
        )}

        {ad.type && (
          <p>
            <strong>🏷️ Type:</strong> {ad.type}
          </p>
        )}

        {ad.subcategory && (
          <p>
            <strong>📂 Type:</strong> {ad.subcategory}
          </p>
        )}

        {ad.furnitureType && (
          <p>
            <strong>🛋️ Furniture:</strong> {ad.furnitureType}
          </p>
        )}

        {ad.laborType && (
          <p>
            <strong>👷 Service:</strong> {ad.laborType}
          </p>
        )}

        {/* =========================
            DESCRIPTION
        ========================= */}
        <div className="details-description">
          <h3>Description</h3>
          <p>{ad.description || "No description available."}</p>
        </div>

        <hr />

        {/* =========================
            SELLER PROFILE
        ========================= */}
        <div className="seller-information">
          <h3>👤 Seller Information</h3>

          <div className="seller-profile-card">
            <div className="seller-avatar">
              {seller?.imageUrl ? (
                <img src={seller.imageUrl} alt={sellerName || "Seller"} />
              ) : (
                sellerAvatar
              )}
            </div>
            <div className="seller-profile-details">
              <h3>{sellerName}</h3>
              {sellerCity && <p>📍 {sellerCity}</p>}
            </div>
          </div>

          {/* VIEW PROFILE BUTTON (BLOCK STYLE) */}
          {ad.userId && (
            <Link
              to={`/user/${ad.userId}`}
              className="block-profile-btn"
            >
              👤 View Full Profile
            </Link>
          )}

          {/* =========================
              CONTACT
          ========================= */}
          <h3 className="seller-contact-title">📞 Contact Seller</h3>

          {/* PHONE */}
          {phoneNumber && (
            <a href={`tel:${phoneNumber}`} className="phone-link">
              📞 Call Seller
              <span>{phoneNumber}</span>
            </a>
          )}

          {/* WHATSAPP */}
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn"
            >
              💬 WhatsApp Seller
            </a>
          )}

          {/* TELEGRAM */}
          {telegramUsername && (
            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="telegram-btn"
            >
              ✈️ Contact on Telegram
            </a>
          )}

          {/* NO CONTACT */}
          {!phoneNumber && !whatsappNumber && !telegramUsername && (
            <p>Seller contact information is not available.</p>
          )}
        </div>
      </div>

      {/* =========================
          LIGHTBOX (NEW)
      ========================= */}
      {lightboxOpen && imageList.length > 0 && (
        <ImageLightbox
          images={imageList}
          startIndex={currentImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

export default AdDetails;
