import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

function UserProfile() {
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Load user profile
      const userRef = doc(db, "users", uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(userSnapshot.data());

      // Load user's ads
      const adsQuery = query(collection(db, "ads"), where("userId", "==", uid));
      const adsSnapshot = await getDocs(adsQuery);

      const userAds = adsSnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      // SORT BY POST TIME (NEWEST FIRST)
      userAds.sort((a, b) => getAdTime(b) - getAdTime(a));

      setAds(userAds);
    } catch (error) {
      console.error("Public profile error:", error);
    } finally {
      setLoading(false);
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
        alert("Profile link copied!");
      }
    } catch (error) {
      console.log("Share cancelled.");
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <h1>Loading profile...</h1>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-not-found">
        <h1>User Not Found</h1>
        <p>This profile does not exist or has been removed.</p>
        <Link to="/">← Back Home</Link>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* PUBLIC HEADER */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "👤"}
          </div>
          <div className="profile-header-info">
            <h1>{profile.name || "የኛ ገበያ User"}</h1>
            {profile.city && <p>📍 {profile.city}</p>}
            <p>📢 {ads.length} advertisement{ads.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="profile-actions">
            <button onClick={shareProfile} className="profile-share-button">
              🔗 Share Profile
            </button>
          </div>
        </div>

        {/* CONTACT */}
        <div className="profile-section">
          <h2>📞 About This Seller</h2>
          {profile.phone && <p className="public-profile-detail">📞 <a href={`tel:${profile.phone}`}>{profile.phone}</a></p>}
          {profile.city && <p className="public-profile-detail">📍 {profile.city}</p>}
        </div>

        {/* ADS */}
        <div className="profile-section">
          <div className="profile-section-heading">
            <h2>📢 Advertisements</h2>
          </div>

          {ads.length === 0 ? (
            <div className="profile-empty">
              <h3>No advertisements yet.</h3>
            </div>
          ) : (
            <div className="profile-ads-grid">
              {ads.map((ad) => {
                const adImage = Array.isArray(ad.images) && ad.images.length > 0 ? ad.images[0] : ad.image;
                const postedTime = getPostedTime(ad.createdAt);

                return (
                  <Link to={`/ad/${ad.id}`} className="profile-ad-card" key={ad.id}>
                    <div className="profile-ad-image">
                      {adImage ? (
                        <img src={adImage} alt={ad.title || "Advertisement"} />
                      ) : (
                        <span>📷 No Image</span>
                      )}
                    </div>
                    <div className="profile-ad-info">
                      <span>{ad.category || "Advertisement"}</span>
                      <h3>{ad.title || "Advertisement"}</h3>
                      <strong>
                        ETB {Number(String(ad.price || 0).replace(/,/g, "")).toLocaleString("en-US")}
                      </strong>
                      {ad.city && <p>📍 {ad.city}</p>}
                      
                      {/* POSTED TIME */}
                      {postedTime && (
                        <p className="latest-ad-posted-time">🕒 Posted {postedTime}</p>
                      )}
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
