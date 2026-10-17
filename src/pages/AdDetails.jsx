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
  updateDoc,
  deleteDoc, // ✅ For deleting ads
  collection,
  addDoc,
  increment,
  query,
  where,
  getDocs,
  serverTimestamp,
  limit,
} from "firebase/firestore";

import { db, auth } from "../firebase/firebase";
import ShareButtons from "../components/ShareButtons";
import ImageLightbox from "../components/ImageLightbox";

// 👇👇 CHANGE THIS TO YOUR ACTUAL LOGIN EMAIL 👇👇
const ADMIN_EMAIL = "your-email@gmail.com"; 

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [similarAds, setSimilarAds] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

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

      // INCREMENT VIEW COUNT
      try {
        const viewerId = auth.currentUser?.uid || "guest";
        const sessionKey = `viewed_${id}_${viewerId}`;
        const alreadyViewed = sessionStorage.getItem(sessionKey);
        const isOwner = auth.currentUser?.uid === adData.userId;

        if (!alreadyViewed && !isOwner) {
          await updateDoc(docRef, { views: increment(1) });
          sessionStorage.setItem(sessionKey, "1");
          setAd((prev) => ({
            ...prev,
            views: (prev.views || 0) + 1,
          }));
        }
      } catch (viewErr) {
        console.error("View count error:", viewErr);
      }

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
        }
      }

      // CHECK FAVORITE
      if (auth.currentUser) {
        const favoriteRef = doc(db, "users", auth.currentUser.uid, "favorites", id);
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
  // DELETE AD (Owner or Admin)
  // =========================
  const handleDeleteAd = async () => {
    if (!ad || !auth.currentUser) return;
    
    const isAdmin = auth.currentUser.email === ADMIN_EMAIL;
    const isRealOwner = ad.userId === auth.currentUser.uid;

    if (!isRealOwner && !(ad.source === "telegram" && isAdmin)) {
      alert("Only the owner or admin can delete this ad.");
      return;
    }

    if (!window.confirm("Are you sure you want to permanently delete this advertisement? This cannot be undone.")) {
      return;
    }

    try {
      setDeleteLoading(true);
      await deleteDoc(doc(db, "ads", id));
      alert("✅ Advertisement deleted successfully.");
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete advertisement: " + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================
  // FETCH TIERED SIMILAR ADS
  // =========================
  useEffect(() => {
    const fetchSimilarAds = async () => {
      if (!ad || !ad.category) return;

      try {
        setLoadingSimilar(true);
        const q = query(
          collection(db, "ads"),
          where("category", "==", ad.category),
          limit(30)
        );

        const snapshot = await getDocs(q);
        const allAds = snapshot.docs
          .map((document) => ({ id: document.id, ...document.data() }))
          .filter((item) => item.id !== ad.id);

        const norm = (v) => String(v || "").trim().toLowerCase();
        const extractYear = (text) => {
          const match = String(text || "").match(/\b(19|20)\d{2}\b/);
          return match ? parseInt(match[0]) : null;
        };
        const detectFuel = (text) => {
          const t = norm(text);
          if (/\b(ev|electric)\b/.test(t)) return "electric";
          if (/\bhybrid\b/.test(t)) return "hybrid";
          if (/\bdiesel\b/.test(t)) return "diesel";
          if (/\b(petrol|gasoline|benzine)\b/.test(t)) return "petrol";
          return null;
        };

        const adFuel = norm(ad.fuelType || ad.fuel || detectFuel(`${ad.title || ""} ${ad.description || ""}`));
        const adBrand = norm(ad.brand);
        const adName = norm(ad.name || ad.model);
        const adYear = parseInt(ad.year || ad.productionYear) || extractYear(ad.title);

        const scoredAds = allAds.map((item) => {
          let score = 0;
          const itemFuel = norm(item.fuelType || item.fuel || detectFuel(`${item.title || ""} ${item.description || ""}`));
          const itemBrand = norm(item.brand);
          const itemName = norm(item.name || item.model);
          const itemYear = parseInt(item.year || item.productionYear) || extractYear(item.title);

          if (adFuel && itemFuel && adFuel === itemFuel) score += 100;
          if (adBrand && itemBrand && adBrand === itemBrand) score += 80;
          if (adName && itemName && adName === itemName) score += 70;
          if (ad.subcategory && item.subcategory === ad.subcategory) score += 50;
          if (ad.type && item.type === ad.type) score += 30;

          if (adYear && itemYear) {
            const yearDiff = Math.abs(adYear - itemYear);
            if (yearDiff === 0) score += 40;
            else if (yearDiff === 1) score += 25;
            else if (yearDiff <= 3) score += 10;
          }

          if (ad.title && item.title) {
            const adWords = norm(ad.title).split(/\s+/).filter((w) => w.length > 3);
            const itemWords = norm(item.title).split(/\s+/);
            const commonWords = adWords.filter((w) => itemWords.includes(w));
            score += commonWords.length * 15;
          }

          if (ad.condition && item.condition === ad.condition) score += 20;
          if (ad.city && item.city && norm(ad.city) === norm(item.city)) score += 15;

          const adPrice = Number(String(ad.price || 0).replace(/,/g, ""));
          const itemPrice = Number(String(item.price || 0).replace(/,/g, ""));
          if (adPrice > 0 && itemPrice > 0) {
            const diff = (Math.abs(adPrice - itemPrice) / adPrice) * 100;
            if (diff <= 20) score += 25;
            else if (diff <= 50) score += 10;
          }

          return { ...item, similarityScore: score };
        });

        const sortedAds = scoredAds
          .filter((item) => item.similarityScore > 0)
          .sort((a, b) => b.similarityScore - a.similarityScore)
          .slice(0, 4);

        setSimilarAds(sortedAds);
      } catch (error) {
        console.error("Error fetching similar ads:", error);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilarAds();
  }, [ad]);

  // =========================
  // REPORT AD
  // =========================
  const reportAd = async () => {
    if (!auth.currentUser) {
      alert("Please log in to report an advertisement.");
      navigate("/login");
      return;
    }
    if (!ad) return;
    if (ad.userId === auth.currentUser.uid) {
      alert("You cannot report your own advertisement.");
      return;
    }

    const reason = window.prompt("Why are you reporting this ad?\n\nExamples: scam, wrong info, offensive, duplicate");
    if (!reason || !reason.trim()) return;

    try {
      setReportLoading(true);
      const reportsRef = collection(db, "reports");
      const q = query(reportsRef, where("adId", "==", id), where("reportedBy", "==", auth.currentUser.uid));
      const existing = await getDocs(q);

      if (!existing.empty) {
        alert("You already reported this advertisement. Thank you!");
        setReportLoading(false);
        return;
      }

      await addDoc(reportsRef, {
        adId: id,
        adTitle: ad.title || "",
        adUserId: ad.userId || "",
        reportedBy: auth.currentUser.uid,
        reportedByEmail: auth.currentUser.email || "",
        reason: reason.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("Thank you. We'll review this ad. ✅");
    } catch (err) {
      console.error("Report error:", err);
      alert("Could not submit report: " + err.message);
    } finally {
      setReportLoading(false);
    }
  };

  // =========================
  // TOGGLE SOLD STATUS
  // =========================
  const toggleSoldStatus = async () => {
    if (!ad || !auth.currentUser) return;
    const isAdmin = auth.currentUser.email === ADMIN_EMAIL;
    const isRealOwner = ad.userId === auth.currentUser.uid;

    if (!isRealOwner && !(ad.source === "telegram" && isAdmin)) {
      alert("Only the owner or admin can change this.");
      return;
    }

    const newStatus = ad.status === "sold" ? "available" : "sold";
    const confirmMsg = newStatus === "sold" ? "Mark this advertisement as SOLD?" : "Mark this advertisement as AVAILABLE again?";
    if (!window.confirm(confirmMsg)) return;

    try {
      setStatusLoading(true);
      await updateDoc(doc(db, "ads", id), {
        status: newStatus,
        soldAt: newStatus === "sold" ? new Date() : null,
      });
      setAd((prev) => ({ ...prev, status: newStatus }));
      alert(newStatus === "sold" ? "Marked as SOLD ✅" : "Marked as AVAILABLE ✅");
    } catch (err) {
      console.error("Status update error:", err);
      alert("Could not update status: " + err.message);
    } finally {
      setStatusLoading(false);
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
      const favoriteRef = doc(db, "users", auth.currentUser.uid, "favorites", id);

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
          image: ad.image || "",
          images: ad.images || [],
          userId: ad.userId || "",
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
      if (!sellerId) return;

      const chatId = buyerId < sellerId ? `${buyerId}_${sellerId}_${id}` : `${sellerId}_${buyerId}_${id}`;
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [buyerId, sellerId],
          buyerId,
          sellerId,
          adId: id,
          adTitle: ad.title || "",
          adImage: Array.isArray(ad.images) && ad.images.length > 0 ? ad.images[0] : ad.image || "",
          buyerName: auth.currentUser.displayName || auth.currentUser.email || "Buyer",
          sellerName: seller?.name || ad.userName || "Seller",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessage: "",
        });

        await addDoc(collection(db, "users", sellerId, "notifications"), {
          type: "chat",
          title: "New chat request 💬",
          message: `${auth.currentUser.displayName || auth.currentUser.email || "Someone"} wants to chat with you about "${ad.title}".`,
          adId: id,
          chatId,
          read: false,
          createdAt: new Date(),
        });
      }
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setChatLoading(false);
    }
  };

  const getPostedTime = (createdAt) => {
    if (!createdAt) return "";
    let date;
    if (typeof createdAt.toDate === "function") date = createdAt.toDate();
    else if (typeof createdAt.seconds === "number") date = new Date(createdAt.seconds * 1000);
    else date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";

    const difference = Date.now() - date.getTime();
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    if (days < 1) return "Today";
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  if (loading) return <div className="details-page"><h2>Loading...</h2></div>;
  if (!ad) return <div className="details-page"><h2>Advertisement not found.</h2><Link to="/">← Back Home</Link></div>;

  const imageList = Array.isArray(ad.images) && ad.images.length > 0 ? ad.images : ad.image ? [ad.image] : [];
  const phoneNumber = ad.phone || "";
  const sellerName = seller?.name || ad.userName || "Telegram Seller";
  const sellerCity = seller?.city || ad.city || "";
  
  const isAdmin = auth.currentUser?.email === ADMIN_EMAIL;
  const isOwner = ad.userId === auth.currentUser?.uid || (ad.source === "telegram" && isAdmin);
  const isSold = ad.status === "sold";

  return (
    <div className="details-page">
      <div className="details-image">
        {imageList.length > 0 ? (
          <img
            src={imageList[currentImage]}
            alt={ad.title || "Advertisement"}
            className="details-photo"
            onClick={() => setLightboxOpen(true)}
            style={{ cursor: "zoom-in" }}
          />
        ) : (
          <div className="no-details-image">📷 No Image Available</div>
        )}
        {isSold && <div className="sold-overlay-big">SOLD</div>}
      </div>

      <div className="details-info">
        <span className={`status-badge ${isSold ? "sold" : "available"}`}>
          {isSold ? "❌ SOLD OUT" : "✅ AVAILABLE"}
        </span>

        <div className="details-meta-row">
          <span className="posted-time">🕒 Posted {getPostedTime(ad.createdAt)}</span>
          <span className="views-count">👁 {ad.views || 0} views</span>
        </div>

        <span className="details-category">{ad.category || "Advertisement"}</span>
        <h1>{ad.title || "Untitled Advertisement"}</h1>
        <h2>ETB {ad.price}</h2>

        {isOwner && (
          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button
              type="button"
              onClick={toggleSoldStatus}
              disabled={statusLoading}
              className={`mark-sold-btn ${isSold ? "active" : ""}`}
              style={{ flex: 1 }}
            >
              {statusLoading ? "Updating..." : isSold ? "↩️ Mark Available" : "✅ Mark Sold"}
            </button>
            
            {/* ✅ DELETE BUTTON */}
            <button
              type="button"
              onClick={handleDeleteAd}
              disabled={deleteLoading}
              style={{ 
                flex: 1, 
                background: "#dc2626", 
                color: "white", 
                border: "none", 
                borderRadius: "10px", 
                fontWeight: "bold", 
                cursor: "pointer" 
              }}
            >
              {deleteLoading ? "Deleting..." : "🗑️ Delete Ad"}
            </button>
          </div>
        )}

        <div className="details-actions-row">
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            className={`action-btn favorite-action ${isFavorite ? "active" : ""}`}
          >
            {favoriteLoading ? "Saving..." : isFavorite ? "❤️ Saved" : "🤍 Save Ad"}
          </button>

          {!isOwner && ad.userId && (
            <button
              type="button"
              onClick={startChat}
              disabled={chatLoading || isSold}
              className="action-btn chat-action"
            >
              {chatLoading ? "Opening..." : isSold ? "❌ Sold" : "💬 Chat"}
            </button>
          )}
        </div>

        {ad.city && <p><strong>📍 City:</strong> {ad.city}</p>}
        {ad.condition && <p><strong>🔄 Condition:</strong> {ad.condition}</p>}
        {ad.type && <p><strong>🏷️ Type:</strong> {ad.type}</p>}
        {ad.subcategory && <p><strong>📂 Category:</strong> {ad.subcategory}</p>}
        {ad.furnitureType && <p><strong>🛋️ Furniture:</strong> {ad.furnitureType}</p>}
        {ad.laborType && <p><strong>👷 Service:</strong> {ad.laborType}</p>}

        <div className="details-description">
          <h3>Description</h3>
          <p>{ad.description || "No description available."}</p>
        </div>

        <ShareButtons adId={id} title={ad.title || "Advertisement"} price={ad.price} city={ad.city} />

        <hr />

        <div className="seller-information">
          <h3>👤 Seller Information</h3>
          <div className="seller-profile-card">
            <div className="seller-avatar">
              {seller?.imageUrl ? (
                <img src={seller.imageUrl} alt={sellerName} />
              ) : (
                sellerName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="seller-profile-details">
              <h3>{sellerName}</h3>
              {sellerCity && <p>📍 {sellerCity}</p>}
            </div>
          </div>

          {ad.userId && (
            <Link to={`/user/${ad.userId}`} className="block-profile-btn">
              👤 View Full Profile
            </Link>
          )}

          <h3 className="seller-contact-title">📞 Contact Seller</h3>
          {phoneNumber && (
            <a href={`tel:${phoneNumber}`} className="phone-link">
              📞 Call Seller
              <span>{phoneNumber}</span>
            </a>
          )}
        </div>

        {!isOwner && (
          <button
            type="button"
            onClick={reportAd}
            disabled={reportLoading}
            className="report-ad-btn"
          >
            {reportLoading ? "Submitting..." : "🚩 Report This Ad"}
          </button>
        )}
      </div>

      {/* SIMILAR ADS SECTION */}
      {similarAds.length > 0 && (
        <section className="similar-ads-section">
          <div className="similar-ads-header">
            <h2>Similar Ads</h2>
            <Link to={`/search?category=${encodeURIComponent(ad.category)}`} className="view-all-similar">
              View All →
            </Link>
          </div>

          <div className="similar-ads-grid">
            {similarAds.map((item) => {
              const image = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image;
              return (
                <Link to={`/ad/${item.id}`} key={item.id} className="similar-ad-card">
                  <div className="similar-ad-image">
                    {image ? <img src={image} alt={item.title} loading="lazy" /> : <div className="no-image">📷 No Image</div>}
                  </div>
                  <div className="similar-ad-info">
                    <h3>{item.title || "Untitled"}</h3>
                    <h4>ETB {item.price}</h4>
                    {item.city && <p>📍 {item.city}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {lightboxOpen && imageList.length > 0 && (
        <ImageLightbox images={imageList} startIndex={currentImage} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}

export default AdDetails;
