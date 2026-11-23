import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

function UserProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  // =========================
  // GET AD TIME (FOR SORTING)
  // =========================
  const getAdTime = (ad) => {
    if (!ad?.createdAt) return 0;
    if (typeof ad.createdAt.toMillis === "function") return ad.createdAt.toMillis();
    if (typeof ad.createdAt === "object" && ad.createdAt.seconds) return ad.createdAt.seconds * 1000;
    if (ad.createdAt instanceof Date) return ad.createdAt.getTime();
    const date = new Date(ad.createdAt).getTime();
    return Number.isNaN(date) ? 0 : date;
  };

  // =========================
  // DISPLAY POST TIME
  // =========================
  const getPostedTime = (createdAt) => {
    if (!createdAt) return "";
    let postedDate;
    if (typeof createdAt.toDate === "function") postedDate = createdAt.toDate();
    else if (createdAt.seconds) postedDate = new Date(createdAt.seconds * 1000);
    else if (createdAt instanceof Date) postedDate = createdAt;
    else postedDate = new Date(createdAt);

    if (Number.isNaN(postedDate.getTime())) return "";

    const now = new Date();
    const difference = now.getTime() - postedDate.getTime();
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (difference < 0) return "Just now";
    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

    return postedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  useEffect(() => {
    loadUser();
  }, [uid]);

  const loadUser = async () => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const profileData = userSnapshot.data();
      setProfile(profileData);

      // Load ALL ads and filter by this user
      const allAdsSnap = await getDocs(collection(db, "ads"));
      const allAds = allAdsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const userAds = allAds.filter((ad) => {
        return (
          ad.userId === uid ||
          ad.uid === uid ||
          ad.ownerId === uid ||
          ad.userEmail === profileData.email
        );
      });

      userAds.sort((a, b) => getAdTime(b) - getAdTime(a));
      setAds(userAds);
    } catch (error) {
      console.error("Public profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // START CHAT WITH SELLER
  // =========================
  const startChat = async () => {
    if (!auth.currentUser) {
      alert("Please log in to chat with the seller.");
      navigate("/login");
      return;
    }

    if (uid === auth.currentUser.uid) {
      alert("This is your own profile.");
      return;
    }

    try {
      setChatLoading(true);
      const buyerId = auth.currentUser.uid;
      const sellerId = uid;

      // Use the most recent ad as context (if available)
      const recentAd = ads.length > 0 ? ads[0] : null;
      const adId = recentAd?.id || "general";

      const chatId =
        buyerId < sellerId
          ? `${buyerId}_${sellerId}_${adId}`
          : `${sellerId}_${buyerId}_${adId}`;

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [buyerId, sellerId],
          buyerId,
          sellerId,
          adId: adId,
          adTitle: recentAd?.title || "General inquiry",
          adImage: recentAd
            ? (Array.isArray(recentAd.images) && recentAd.images.length > 0
                ? recentAd.images[0]
                : recentAd.image || "")
            : "",
          buyerName:
            auth.currentUser.displayName ||
            auth.currentUser.email ||
            "Buyer",
          sellerName: profile?.name || "Seller",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessage: "",
        });

        // Notify the seller
        await addDoc(collection(db, "users", sellerId, "notifications"), {
          type: "chat",
          title: "New chat request 💬",
          message: `${
            auth.currentUser.displayName ||
            auth.currentUser.email ||
            "Someone"
          } wants to chat with you.`,
          adId: adId,
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

  const shareProfile = async () => {
    const profileUrl = window.location.href;
    const shareData = {
      title: `${profile?.name || "User"} - የኛ ገበያ`,
      text: `View ${profile?.name || "this user's"} profile on የኛ ገበያ.`,
      url: profileUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(profileUrl);
        alert("Profile link copied! 🔗");
      }
    } catch (error) {
      console.log("Share cancelled.");
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="dashboard-spinner"></div>
        <h2>Loading profile...</h2>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-not-found">
        <div className="login-required-icon">🔍</div>
        <h1>User Not Found</h1>
        <p>This profile doesn't exist or has been removed.</p>
        <Link to="/" className="dashboard-primary-btn">← Back Home</Link>
      </div>
    );
  }

  const avatarLetter = profile.name ? profile.name.charAt(0).toUpperCase() : "👤";
  const isOwnProfile = auth.currentUser?.uid === uid;

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* PROFILE HEADER */}
        <div className="profile-header public-profile-header">
          <div className="profile-avatar">
  {profile.imageUrl ? (
    <img src={profile.imageUrl} alt={profile.name || "User"} />
  ) : (
    avatarLetter
  )}
</div>
          <div className="profile-header-info">
            <h1>{profile.name || "የኛ ገበያ User"}</h1>
            {profile.city && <p>📍 {profile.city}</p>}
            <p>📢 {ads.length} advertisement{ads.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* ACTION BUTTONS (CHAT + SHARE) */}
        {!isOwnProfile && (
          <div className="profile-action-row">
            <button
              onClick={startChat}
              disabled={chatLoading}
              className="profile-chat-btn"
            >
              {chatLoading ? "Opening..." : "💬 Message Seller"}
            </button>
            <button
              onClick={shareProfile}
              className="profile-share-icon-btn"
              aria-label="Share profile"
            >
              🔗
            </button>
          </div>
        )}

        {/* CONTACT SECTION */}
        {(profile.phone || profile.city || profile.email) && (
          <div className="profile-section">
            <h2>📞 Contact Information</h2>
            {profile.phone && (
              <p className="public-profile-detail">
                📞 <a href={`tel:${profile.phone}`}>{profile.phone}</a>
              </p>
            )}
            {profile.city && (
              <p className="public-profile-detail">📍 {profile.city}</p>
            )}
            {profile.email && (
              <p className="public-profile-detail">
                📧 <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </p>
            )}
          </div>
        )}

        {/* ALL ADS */}
        <div className="profile-section">
          <div className="profile-section-heading">
            <h2>📢 All Advertisements</h2>
            <span className="profile-ad-count">
              {ads.length} ad{ads.length !== 1 ? "s" : ""}
            </span>
          </div>

          {ads.length === 0 ? (
            <div className="profile-empty">
              <div className="no-ads-icon">📭</div>
              <h3>No advertisements yet</h3>
              <p>This seller hasn't posted any ads.</p>
            </div>
          ) : (
            <div className="public-ads-grid">
              {ads.map((ad) => {
                const adImage = Array.isArray(ad.images) && ad.images.length > 0
                  ? ad.images[0]
                  : ad.image;
                const postedTime = getPostedTime(ad.createdAt);

                return (
                  <Link to={`/ad/${ad.id}`} className="public-ad-card" key={ad.id}>
                    <div className="public-ad-image">
                      {adImage ? (
                        <img src={adImage} alt={ad.title || "Advertisement"} loading="lazy" />
                      ) : (
                        <div className="public-ad-no-image">📷</div>
                      )}
                    </div>
                    <div className="public-ad-info">
                      <span className="public-ad-category">
                        {ad.category || "Advertisement"}
                      </span>
                      <h3>{ad.title || "Untitled"}</h3>
                      <strong className="public-ad-price">
                        ETB {Number(String(ad.price || 0).replace(/,/g, "")).toLocaleString("en-US")}
                      </strong>
                      {ad.city && <p className="public-ad-city">📍 {ad.city}</p>}
                      {postedTime && <p className="public-ad-time">🕒 {postedTime}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default UserProfile;
