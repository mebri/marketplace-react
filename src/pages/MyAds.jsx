import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

import { auth, db } from "../firebase/firebase";

function MyAds() {
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          setUser(null);
          setAds([]);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        try {
          const snapshot = await getDocs(
            collection(db, "ads")
          );

          const allAds = snapshot.docs.map(
            (item) => ({
              id: item.id,
              ...item.data(),
            })
          );

          const myAds = allAds.filter(
            (ad) =>
              ad.userId === currentUser.uid
          );

          setAds(myAds);
        } catch (error) {
          console.error(
            "My Ads error:",
            error
          );
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // DELETE AD
  const deleteAd = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this advertisement?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, "ads", id)
      );

      setAds((currentAds) =>
        currentAds.filter(
          (ad) => ad.id !== id
        )
      );

      alert(
        "Advertisement deleted successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        "Could not delete advertisement."
      );
    }
  };

  if (loading) {
    return (
      <div className="my-ads-page">
        <h1>Loading My Ads...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="my-ads-page my-ads-login">
        <h1>🔒 Login Required</h1>

        <p>
          Please login to see your advertisements.
        </p>

        <Link to="/login">
          <button className="primary-btn">
            Login
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="my-ads-page">

      {/* HEADER */}

      <div className="my-ads-header">

        <div>
          <h1>
            📋 My Advertisements
          </h1>

          <p>
            {ads.length} advertisement
            {ads.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <Link to="/post-ad">
          <button className="post-new-btn">
            ➕ Post New Ad
          </button>
        </Link>

      </div>

      {/* NO ADS */}

      {ads.length === 0 ? (

        <div className="no-my-ads">

          <div className="no-ads-icon">
            📢
          </div>

          <h2>
            You have no advertisements yet.
          </h2>

          <p>
            Start selling by posting your first
            advertisement.
          </p>

          <Link to="/post-ad">
            <button className="primary-btn">
              ➕ Post Advertisement
            </button>
          </Link>

        </div>

      ) : (

        /* ADS GRID */

        <div className="my-ads-grid">

          {ads.map((ad) => {

            const images =
              Array.isArray(ad.images) &&
              ad.images.length > 0
                ? ad.images
                : ad.image
                ? [ad.image]
                : [];

            const firstImage =
              images.length > 0
                ? images[0]
                : null;

            return (
              <div
                className="my-ad-card"
                key={ad.id}
              >

                {/* IMAGE */}

                <div className="my-ad-image">

                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={ad.title}
                    />
                  ) : (
                    <div className="my-ad-no-image">
                      📷
                      <span>
                        No Image
                      </span>
                    </div>
                  )}

                  {/* IMAGE COUNT */}

                  {images.length > 1 && (
                    <span className="image-count">
                      🖼️ {images.length}
                    </span>
                  )}

                </div>

                {/* INFORMATION */}

                <div className="my-ad-content">

                  <span className="my-ad-category">
                    {ad.category}
                  </span>

                  <h2>
                    {ad.title}
                  </h2>

                  <div className="my-ad-price">
                    ETB {ad.price}
                  </div>

                  <p>
                    📍 {ad.city}
                  </p>

                  {ad.condition && (
                    <p>
                      🔄 {ad.condition}
                    </p>
                  )}

                  {ad.type && (
                    <p>
                      🏷️ {ad.type}
                    </p>
                  )}

                  {ad.phone && (
                    <p>
                      📞 {ad.phone}
                    </p>
                  )}

                  {/* BUTTONS */}

                  <div className="my-ad-actions">

                    <Link
                      to={`/ad/${ad.id}`}
                      className="ad-action-link"
                    >
                      <button className="view-ad-btn">
                        👁 View
                      </button>
                    </Link>

                    <Link
                      to={`/edit-ad/${ad.id}`}
                      className="ad-action-link"
                    >
                      <button className="edit-ad-btn">
                        ✏️ Edit
                      </button>
                    </Link>

                    <button
                      className="delete-ad-btn"
                      onClick={() =>
                        deleteAd(ad.id)
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default MyAds;