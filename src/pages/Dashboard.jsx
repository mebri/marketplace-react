import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { auth, db } from "../firebase/firebase";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // =========================
  // GET AD TIME
  // =========================

  const getAdTime = (ad) => {
    if (!ad.createdAt) return 0;

    // Firestore Timestamp
    if (
      typeof ad.createdAt.toMillis ===
      "function"
    ) {
      return ad.createdAt.toMillis();
    }

    // Firestore Timestamp object
    if (ad.createdAt.seconds) {
      return (
        ad.createdAt.seconds * 1000
      );
    }

    // JavaScript Date
    if (ad.createdAt instanceof Date) {
      return ad.createdAt.getTime();
    }

    // String / fallback
    const time = new Date(
      ad.createdAt
    ).getTime();

    return Number.isNaN(time)
      ? 0
      : time;
  };

  // =========================
  // LOAD USER + ADS
  // =========================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
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
            const snapshot =
              await getDocs(
                collection(db, "ads")
              );

            const allAds =
              snapshot.docs.map(
                (item) => ({
                  id: item.id,
                  ...item.data(),
                })
              );

            // Only current user's ads
            const myAds =
              allAds.filter(
                (ad) =>
                  ad.userId ===
                  currentUser.uid
              );

            // =========================
            // NEWEST FIRST
            // =========================

            myAds.sort(
              (a, b) =>
                getAdTime(b) -
                getAdTime(a)
            );

            setAds(myAds);

          } catch (error) {

            console.error(
              "Dashboard error:",
              error
            );

          } finally {

            setLoading(false);

          }

        }
      );

    return () => unsubscribe();

  }, []);

  // =========================
  // LOGOUT
  // =========================

  const logout = async () => {

    try {

      await signOut(auth);

      navigate("/login");

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  };

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <main className="dashboard-page">

        <div className="dashboard-loading">

          <div className="dashboard-spinner"></div>

          <h2>
            Loading Dashboard...
          </h2>

        </div>

      </main>

    );

  }

  // =========================
  // LOGIN REQUIRED
  // =========================

  if (!user) {

    return (

      <main className="dashboard-page">

        <div className="login-required">

          <div className="login-required-icon">
            🔒
          </div>

          <h1>
            Login Required
          </h1>

          <p>
            Please login to access your dashboard.
          </p>

          <Link
            to="/login"
            className="dashboard-primary-btn"
          >
            Login
          </Link>

        </div>

      </main>

    );

  }

  // =========================
  // TOTAL IMAGES
  // =========================

  const totalImages =
    ads.reduce(
      (total, ad) => {

        if (
          Array.isArray(ad.images)
        ) {

          return (
            total +
            ad.images.length
          );

        }

        return ad.image
          ? total + 1
          : total;

      },
      0
    );

  // =========================
  // TOTAL CATEGORIES
  // =========================

  const totalCategories = [
    ...new Set(

      ads
        .map(
          (ad) =>
            ad.category
        )
        .filter(Boolean)

    ),
  ].length;

  return (

    <main className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="dashboard-header">

        <div>

          <h1>
            👋 Dashboard
          </h1>

          <p className="dashboard-welcome">
            Welcome back!
          </p>

          <p className="dashboard-email">
            {user.email}
          </p>

        </div>

        <Link
          to="/post-ad"
          className="dashboard-post-btn"
        >
          ➕ Post New Ad
        </Link>

      </section>


      {/* =========================
          STATISTICS
      ========================= */}

      <section className="dashboard-stats">

        <div className="dashboard-stat-card">

          <div className="stat-icon">
            📢
          </div>

          <div>

            <h2>
              {ads.length}
            </h2>

            <p>
              My Ads
            </p>

          </div>

        </div>


        <div className="dashboard-stat-card">

          <div className="stat-icon">
            🖼️
          </div>

          <div>

            <h2>
              {totalImages}
            </h2>

            <p>
              My Images
            </p>

          </div>

        </div>


        <div className="dashboard-stat-card">

          <div className="stat-icon">
            🏷️
          </div>

          <div>

            <h2>
              {totalCategories}
            </h2>

            <p>
              Categories
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <section className="dashboard-actions">

        <Link
          to="/post-ad"
          className="dashboard-action post"
        >

          <span>
            ➕
          </span>

          <div>

            <strong>
              Post Advertisement
            </strong>

            <small>
              Create a new listing
            </small>

          </div>

        </Link>


        <Link
          to="/my-ads"
          className="dashboard-action"
        >

          <span>
            📋
          </span>

          <div>

            <strong>
              My Advertisements
            </strong>

            <small>
              Manage your listings
            </small>

          </div>

        </Link>


        <Link
          to="/"
          className="dashboard-action"
        >

          <span>
            🏠
          </span>

          <div>

            <strong>
              Home
            </strong>

            <small>
              Browse the marketplace
            </small>

          </div>

        </Link>


        <button
          onClick={logout}
          className="dashboard-action logout"
        >

          <span>
            🚪
          </span>

          <div>

            <strong>
              Logout
            </strong>

            <small>
              Sign out of your account
            </small>

          </div>

        </button>

      </section>


      {/* =========================
          LATEST ADS
      ========================= */}

      <section className="dashboard-ads-section">

        <div className="dashboard-section-header">

          <div>

            <h2>
              📢 My Latest Advertisements
            </h2>

            <p>
              Your most recently posted items
            </p>

          </div>


          {ads.length > 0 && (

            <Link
              to="/my-ads"
              className="view-all-link"
            >
              View All →
            </Link>

          )}

        </div>


        {/* =========================
            EMPTY
        ========================= */}

        {ads.length === 0 ? (

          <div className="dashboard-empty">

            <div className="empty-icon">
              📭
            </div>

            <h3>
              You have no advertisements yet
            </h3>

            <p>
              Start selling by posting
              your first advertisement.
            </p>

            <Link
              to="/post-ad"
              className="dashboard-primary-btn"
            >
              ➕ Post Your First Ad
            </Link>

          </div>

        ) : (

          /* =========================
              ADS GRID
          ========================= */

          <div className="dashboard-ads-grid">

            {ads
              .slice(0, 6)
              .map((ad) => {

                // Get first image

                const adImage =
                  Array.isArray(
                    ad.images
                  ) &&
                  ad.images.length > 0
                    ? ad.images[0]
                    : ad.image;


                return (

                  <article
                    className="dashboard-ad-card"
                    key={ad.id}
                  >

                    {/* =========================
                        CLICKABLE IMAGE
                    ========================= */}

                    <Link
                      to={`/ad/${ad.id}`}
                      className="dashboard-ad-image-link"
                      aria-label={`View ${
                        ad.title ||
                        "Advertisement"
                      }`}
                    >

                      <div className="dashboard-ad-image">

                        {adImage ? (

                          <img
                            src={adImage}
                            alt={
                              ad.title ||
                              "Advertisement"
                            }
                            loading="lazy"
                            onError={(e) => {

                              e.currentTarget.style.display =
                                "none";

                            }}
                          />

                        ) : (

                          <div className="dashboard-no-image">

                            📷

                            <span>
                              No Image
                            </span>

                          </div>

                        )}

                      </div>

                    </Link>


                    {/* =========================
                        INFORMATION
                    ========================= */}

                    <div className="dashboard-ad-info">

                      <span className="dashboard-ad-category">

                        {ad.category ||
                          "Other"}

                      </span>


                      {/* CLICKABLE TITLE */}

                      <Link
                        to={`/ad/${ad.id}`}
                        className="dashboard-ad-title-link"
                      >

                        <h3>

                          {ad.title ||
                            "Untitled Advertisement"}

                        </h3>

                      </Link>


                      {/* PRICE */}

                      <div className="dashboard-ad-price">

                        ETB{" "}

                        {Number(
                          ad.price || 0
                        ).toLocaleString()}

                      </div>


                      {/* CITY */}

                      <p className="dashboard-ad-city">

                        📍{" "}

                        {ad.city ||
                          "Ethiopia"}

                      </p>


                      {/* =========================
                          POST TIME
                      ========================= */}

                      {ad.createdAt && (

                        <p className="dashboard-ad-time">

                          🕒{" "}

                          {new Date(
                            getAdTime(ad)
                          ).toLocaleString()}

                        </p>

                      )}


                      {/* VIEW DETAILS */}

                      <Link
                        to={`/ad/${ad.id}`}
                        className="dashboard-view-btn"
                      >

                        👁 View Details

                      </Link>

                    </div>

                  </article>

                );

              })}

          </div>

        )}

      </section>

    </main>

  );

}

export default Dashboard;