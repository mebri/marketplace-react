import { uploadImageToCloudinary } from "../utils/uploadImage";
import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ads, setAds] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  // Profile picture
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================
  // GET TIME
  // =========================
  const getTime = (createdAt) => {
    if (!createdAt) return 0;
    if (typeof createdAt.toMillis === "function") return createdAt.toMillis();
    if (createdAt.seconds) return createdAt.seconds * 1000;
    if (createdAt instanceof Date) return createdAt.getTime();
    const time = new Date(createdAt).getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  // =========================
  // FORMAT POST TIME
  // =========================
  const formatPostTime = (createdAt) => {
    const time = getTime(createdAt);
    if (!time) return "Recently";

    const difference = Date.now() - time;
    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
    return new Date(time).toLocaleDateString();
  };

  // =========================
  // AUTH
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);
      await loadProfile(currentUser);
      await loadUserAds(currentUser.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // =========================
  // LOAD PROFILE
  // =========================
  const loadProfile = async (currentUser) => {
    try {
      const profileRef = doc(db, "users", currentUser.uid);
      const snapshot = await getDoc(profileRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfile(data);
        setName(data.name || currentUser.displayName || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
        setImagePreview(data.imageUrl || "");
      } else {
        setName(currentUser.displayName || "");
      }
    } catch (error) {
      console.error("Profile loading error:", error);
    }
  };

  // =========================
  // LOAD USER ADS
  // =========================
  const loadUserAds = async (uid) => {
    try {
      const adsQuery = query(
        collection(db, "ads"),
        where("userId", "==", uid)
      );
      const snapshot = await getDocs(adsQuery);

      const userAds = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      userAds.sort(
        (a, b) => getTime(b.createdAt) - getTime(a.createdAt)
      );

      setAds(userAds);
    } catch (error) {
      console.error("Ads loading error:", error);
    }
  };

  // =========================
  // HANDLE IMAGE SELECTION
  // =========================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // =========================
  // UPLOAD PROFILE PICTURE
  // =========================
  const uploadProfileImage = async () => {
    if (!imageFile || !user) return;

    setImageUploading(true);
    try {
      const downloadURL = await uploadImageToCloudinary(imageFile);

      await setDoc(
        doc(db, "users", user.uid),
        { imageUrl: downloadURL },
        { merge: true }
      );

      setImagePreview(downloadURL);
      setImageFile(null);

      setProfile((current) => ({
        ...current,
        imageUrl: downloadURL,
      }));

      alert("Profile picture updated! ✅");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Could not upload image: " + error.message);
    } finally {
      setImageUploading(false);
    }
  };

  // =========================
  // SAVE PROFILE
  // =========================
  const saveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);

      const updatedName = name.trim();
      const updatedPhone = phone.trim();
      const updatedCity = city.trim();

      await updateProfile(user, { displayName: updatedName });

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: updatedName,
          phone: updatedPhone,
          city: updatedCity,
          email: user.email || "",
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setProfile((current) => ({
        ...current,
        name: updatedName,
        phone: updatedPhone,
        city: updatedCity,
      }));

      setUser({ ...user, displayName: updatedName });

      alert("Profile updated successfully! ✅");
      setIsEditing(false); // <-- Return to read-only mode
    } catch (error) {
      console.error("Profile update error:", error);
      alert(error.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================
  const cancelEdit = () => {
    // Reset form fields to saved values
    if (profile) {
      setName(profile.name || user?.displayName || "");
      setPhone(profile.phone || "");
      setCity(profile.city || "");
    }
    setImageFile(null);
    setIsEditing(false);
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // =========================
  // SHARE PROFILE
  // =========================
  const shareProfile = async () => {
    if (!user) return;

    const profileUrl = `${window.location.origin}${window.location.pathname}#/user/${user.uid}`;

    const shareData = {
      title: `${name || "User"} - የኛ ገበያ`,
      text: `View ${name || "this user's"} profile on የኛ ገበያ.`,
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

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </main>
    );
  }

  // =========================
  // AVATAR
  // =========================
  const avatarLetter = name ? name.charAt(0).toUpperCase() : "👤";

  return (
    <main className="profile-page">
      <div className="profile-container">

        {/* PROFILE HEADER */}
        <section className="profile-header">
          <div className="profile-avatar">
            {imagePreview ? (
              <img src={imagePreview} alt={name || "User"} />
            ) : (
              avatarLetter
            )}
          </div>

          <div className="profile-header-info">
            <h1>{name || "My Account"}</h1>
            <p>{user?.email}</p>
            <p>📍 {city || "Location not added"}</p>
            <p>
              📢 {ads.length} Advertisement{ads.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="profile-actions">
            <button onClick={shareProfile} className="profile-share-button">
              🔗 Share Profile
            </button>
            <button onClick={handleLogout} className="profile-logout-button">
              Logout
            </button>
          </div>
        </section>

        {/* PROFILE SECTION */}
        <section className="profile-section">
          <div className="profile-section-heading">
            <h2>👤 My Profile</h2>
            {!isEditing && (
              <button
                type="button"
                className="profile-post-button"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {/* VIEW MODE (read-only) */}
          {!isEditing && (
            <div className="profile-view">
              <div className="profile-view-row">
                <span className="profile-view-label">Name</span>
                <span className="profile-view-value">{name || "—"}</span>
              </div>
              <div className="profile-view-row">
                <span className="profile-view-label">Email</span>
                <span className="profile-view-value">{user?.email || "—"}</span>
              </div>
              <div className="profile-view-row">
                <span className="profile-view-label">Phone</span>
                <span className="profile-view-value">{phone || "—"}</span>
              </div>
              <div className="profile-view-row">
                <span className="profile-view-label">City</span>
                <span className="profile-view-value">{city || "—"}</span>
              </div>
            </div>
          )}

          {/* EDIT MODE (form) */}
          {isEditing && (
            <form className="profile-form" onSubmit={saveProfile}>

              {/* PROFILE PICTURE UPLOAD */}
              <div className="edit-profile-picture">
                <label>Profile Picture</label>
                <div className="edit-profile-picture-row">
                  <div className="edit-profile-picture-preview">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div className="edit-profile-picture-actions">
                    <label htmlFor="profile-pic-input" className="upload-pic-btn">
                      {imageFile ? "Change Photo" : "📷 Choose Photo"}
                    </label>
                    <input
                      id="profile-pic-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                    {imageFile && (
                      <button
                        type="button"
                        onClick={uploadProfileImage}
                        disabled={imageUploading}
                        className="save-pic-btn"
                      >
                        {imageUploading ? "Uploading..." : "Save Photo"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label>Email</label>
              <input type="email" value={user?.email || ""} disabled />

              <label>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <label>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              {/* SAVE + CANCEL BUTTONS */}
              <div className="profile-form-actions">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="profile-cancel-btn"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "💾 Save Profile"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* PUBLIC PROFILE */}
        <section className="profile-section">
          <h2>🌐 Public Profile</h2>
          <p>Other people can see your profile and advertisements.</p>
          <Link to={`/user/${user.uid}`} className="view-public-profile">
            View My Public Profile →
          </Link>
        </section>

        {/* MY ADS */}
        <section className="profile-section">
          <div className="profile-section-heading">
            <div>
              <h2>📢 My Advertisements</h2>
              <p>
                {ads.length} advertisement{ads.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link to="/post-ad" className="profile-post-button">
              + Post Advertisement
            </Link>
          </div>

          {ads.length === 0 ? (
            <div className="profile-empty">
              <h3>You haven't posted any advertisements yet.</h3>
              <Link to="/post-ad">📢 Post Your First Ad</Link>
            </div>
          ) : (
            <div className="profile-ads-grid">
              {ads.map((ad) => {
                const adImage =
                  Array.isArray(ad.images) && ad.images.length > 0
                    ? ad.images[0]
                    : ad.image;

                return (
                  <Link
                    key={ad.id}
                    to={`/ad/${ad.id}`}
                    className="profile-ad-card"
                  >
                    <div className="profile-ad-image">
                      {adImage ? (
                        <img src={adImage} alt={ad.title || "Advertisement"} />
                      ) : (
                        <div>📷</div>
                      )}
                    </div>

                    <div className="profile-ad-info">
                      <p className="profile-ad-seller">
                        👤 {ad.userName || name || "Seller"}
                      </p>
                      <h3>{ad.title || "Advertisement"}</h3>
                      <strong>
                        ETB{" "}
                        {Number(
                          String(ad.price || 0).replace(/,/g, "")
                        ).toLocaleString("en-US")}
                      </strong>
                      <p>📍 {ad.city || "Ethiopia"}</p>
                      <p className="profile-ad-time">
                        🕒 Posted {formatPostTime(ad.createdAt)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Profile;
