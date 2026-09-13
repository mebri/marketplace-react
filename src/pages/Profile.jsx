import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";

function Profile() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadProfile(currentUser.uid, currentUser.email);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadProfile = async (uid, email) => {
    try {
      // 1. Load user profile data
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        setName(data.name || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
      }

      // 2. Load ALL ads and filter them in JavaScript
      // This avoids Firestore indexing issues and unknown field names
      const adsRef = collection(db, "ads");
      const snapshot = await getDocs(adsRef);

      const allAds = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      // Filter ads that belong to this user
      const userAds = allAds.filter((ad) => {
        return (
          ad.userId === uid ||
          ad.userEmail === email ||
          ad.uid === uid ||
          ad.email === email ||
          ad.ownerId === uid
        );
      });

      // SORT BY POST TIME (NEWEST FIRST)
      userAds.sort((a, b) => getAdTime(b) - getAdTime(a));

      setAds(userAds);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { name, phone, city });
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Error updating profile: " + error.message);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <h1>Loading profile...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-required">
        <div className="login-required-icon">🔒</div>
        <h1>Please Log In</h1>
        <p>You must be logged in to view your profile.</p>
        <Link to="/login" className="dashboard-primary-btn">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* PROFILE HEADER */}
        <div className="profile-header">
          <div className="profile-avatar">
            {name ? name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h1>{name || "User"}</h1>
            <p>📧 {user.email}</p>
            {phone && <p>📞 {phone}</p>}
            {city && <p>📍 {city}</p>}
          </div>
          <div className="profile-actions">
            <button onClick={handleLogout} className="profile-logout-button">Logout</button>
          </div>
        </div>

        {/* EDIT PROFILE FORM */}
        <div className="profile-section">
          <h2>⚙️ Edit Profile</h2>
          {message && <p style={{ color: "green", marginBottom: "15px" }}>{message}</p>}
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />

            <label>Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" />

            <label>City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city" />

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* MY ADS */}
        <div className="profile-section">
          <div className="profile-section-heading">
            <h2>📢 My Advertisements ({ads.length})</h2>
            <Link to="/post-ad" className="profile-post-button">+ Post New Ad</Link>
          </div>

          {ads.length === 0 ? (
            <div className="profile-empty">
              <h3>You haven't posted any ads yet.</h3>
              <Link to="/post-ad">Post your first ad →</Link>
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
                        <img src={adImage} alt={ad.title} />
                      ) : (
                        <span>📷 No Image</span>
                      )}
                    </div>
                    <div className="profile-ad-info">
                      <span>{ad.category}</span>
                      <h3>{ad.title}</h3>
                      <strong>ETB {Number(ad.price || 0).toLocaleString()}</strong>
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

export default Profile;
