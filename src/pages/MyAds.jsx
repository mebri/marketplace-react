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

  const [user, setUser] =
    useState(null);

  const [ads, setAds] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  // =========================
  // GET TIME
  // =========================

  const getAdTime = (createdAt) => {

    if (!createdAt) {
      return 0;
    }

    // Firestore Timestamp
    if (
      typeof createdAt.toMillis ===
      "function"
    ) {
      return createdAt.toMillis();
    }

    // Firestore seconds
    if (createdAt.seconds) {
      return (
        createdAt.seconds * 1000
      );
    }

    // JavaScript Date
    if (
      createdAt instanceof Date
    ) {
      return createdAt.getTime();
    }

    const time =
      new Date(createdAt).getTime();

    return Number.isNaN(time)
      ? 0
      : time;
  };


  // =========================
  // FORMAT POST TIME
  // =========================

  const formatPostTime = (
    createdAt
  ) => {

    if (!createdAt) {
      return "Post time unavailable";
    }

    let date;

    if (
      typeof createdAt.toDate ===
      "function"
    ) {

      date = createdAt.toDate();

    } else if (createdAt.seconds) {

      date = new Date(
        createdAt.seconds * 1000
      );

    } else {

      date = new Date(
        createdAt
      );
    }

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Post time unavailable";
    }

    const now =
      new Date();

    const difference =
      now.getTime() -
      date.getTime();

    const minutes =
      Math.floor(
        difference / 60000
      );

    const hours =
      Math.floor(
        difference / 3600000
      );

    const days =
      Math.floor(
        difference / 86400000
      );

    if (minutes < 1) {
      return "Posted just now";
    }

    if (minutes < 60) {
      return `Posted ${minutes} minute${
        minutes !== 1
          ? "s"
          : ""
      } ago`;
    }

    if (hours < 24) {
      return `Posted ${hours} hour${
        hours !== 1
          ? "s"
          : ""
      } ago`;
    }

    if (days < 7) {
      return `Posted ${days} day${
        days !== 1
          ? "s"
          : ""
      } ago`;
    }

    return (
      "Posted " +
      date.toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      )
    );
  };


  // =========================
  // LOAD MY ADS
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

          setUser(
            currentUser
          );

          setLoading(true);

          try {

            const snapshot =
              await getDocs(
                collection(
                  db,
                  "ads"
                )
              );


            const allAds =
              snapshot.docs.map(
                (item) => ({
                  id:
                    item.id,

                  ...item.data(),
                })
              );


            // =========================
            // FIND MY ADS
            // =========================

            const myAds =
              allAds.filter(
                (ad) => {

                  // Main match
                  if (
                    ad.userId ===
                    currentUser.uid
                  ) {
                    return true;
                  }


                  // Older advertisements
                  // fallback using email

                  if (
                    ad.userEmail &&
                    currentUser.email &&
                    ad.userEmail.toLowerCase() ===
                      currentUser.email.toLowerCase()
                  ) {
                    return true;
                  }


                  return false;

                }
              );


            // =========================
            // SORT NEWEST FIRST
            // =========================

            myAds.sort(
              (a, b) => {

                return (
                  getAdTime(
                    b.createdAt
                  ) -
                  getAdTime(
                    a.createdAt
                  )
                );

              }
            );


            console.log(
              "All Ads:",
              allAds
            );

            console.log(
              "My Ads:",
              myAds
            );

            console.log(
              "Current User ID:",
              currentUser.uid
            );


            setAds(
              myAds
            );


          } catch (error) {

            console.error(
              "My Ads error:",
              error
            );

          } finally {

            setLoading(
              false
            );

          }

        }
      );


    return () =>
      unsubscribe();

  }, []);


  // =========================
  // DELETE AD
  // =========================

  const deleteAd =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this advertisement?"
        );

      if (
        !confirmDelete
      ) {
        return;
      }


      try {

        await deleteDoc(
          doc(
            db,
            "ads",
            id
          )
        );


        setAds(
          (
            currentAds
          ) =>
            currentAds.filter(
              (ad) =>
                ad.id !== id
            )
        );


        alert(
          "Advertisement deleted successfully."
        );


      } catch (
        error
      ) {

        console.error(
          error
        );

        alert(
          error.message ||
            "Could not delete advertisement."
        );

      }

    };


  // =========================
  // LOADING
  // =========================

  if (
    loading
  ) {

    return (

      <div className="my-ads-page">

        <h1>
          Loading My Ads...
        </h1>

      </div>

    );

  }


  // =========================
  // LOGIN REQUIRED
  // =========================

  if (
    !user
  ) {

    return (

      <div className="my-ads-page my-ads-login">

        <h1>
          🔒 Login Required
        </h1>

        <p>
          Please login to see your advertisements.
        </p>

        <Link
          to="/login"
        >

          <button
            className="primary-btn"
          >
            Login
          </button>

        </Link>

      </div>

    );

  }


  // =========================
  // USER NAME
  // =========================

  const userName =
    user.displayName ||
    user.email
      ?.split("@")[0] ||
    "My Account";


  // =========================
  // PAGE
  // =========================

  return (

    <div className="my-ads-page">


      {/* =========================
          ACCOUNT HEADER
      ========================= */}

      <div className="my-ads-account-header">

        <div
          className="my-ads-avatar"
        >

          {userName
            .charAt(0)
            .toUpperCase()}

        </div>


        <div>

          <h1>

            {userName}'s
            Advertisements

          </h1>


          <p>

            📢{" "}

            {ads.length} advertisement
            {ads.length !== 1
              ? "s"
              : ""}

          </p>


          <Link
            to={`/user/${user.uid}`}
          >

            View Public Profile

          </Link>

        </div>


        <Link
          to="/post-ad"
        >

          <button
            className="post-new-btn"
          >

            ➕ Post New Ad

          </button>

        </Link>

      </div>


      {/* =========================
          NO ADS
      ========================= */}

      {ads.length === 0 ? (

        <div
          className="no-my-ads"
        >

          <div
            className="no-ads-icon"
          >

            📢

          </div>


          <h2>

            You have no advertisements yet.

          </h2>


          <p>

            Start selling by posting your first
            advertisement.

          </p>


          <Link
            to="/post-ad"
          >

            <button
              className="primary-btn"
            >

              ➕ Post Advertisement

            </button>

          </Link>

        </div>

      ) : (


        /* =========================
            ADS GRID
        ========================= */

        <div
          className="my-ads-grid"
        >

          {ads.map(
            (ad) => {


              // =========================
              // IMAGES
              // =========================

              const images =

                Array.isArray(
                  ad.images
                ) &&

                ad.images.length > 0

                  ? ad.images

                  : ad.image

                  ? [
                      ad.image
                    ]

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


                  {/* =========================
                      CLICKABLE IMAGE
                  ========================= */}

                  <Link
                    to={`/ad/${ad.id}`}
                    className="my-ad-image-link"
                  >

                    <div
                      className="my-ad-image"
                    >

                      {firstImage ? (

                        <img
                          src={
                            firstImage
                          }

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

                        <div
                          className="my-ad-no-image"
                        >

                          📷

                          <span>

                            No Image

                          </span>

                        </div>

                      )}


                      {/* IMAGE COUNT */}

                      {images.length > 1 && (

                        <span
                          className="image-count"
                        >

                          🖼️{" "}

                          {images.length}

                        </span>

                      )}

                    </div>

                  </Link>


                  {/* =========================
                      INFORMATION
                  ========================= */}

                  <div
                    className="my-ad-content"
                  >


                    {/* CATEGORY */}

                    <span
                      className="my-ad-category"
                    >

                      {ad.category ||
                        "Advertisement"}

                    </span>


                    {/* TITLE */}

                    <h2>

                      {ad.title ||
                        "Untitled Advertisement"}

                    </h2>


                    {/* PRICE */}

                    <div
                      className="my-ad-price"
                    >

                      ETB{" "}

                      {Number(
                        ad.price || 0
                      ).toLocaleString(
                        "en-US"
                      )}

                    </div>


                    {/* POST TIME */}

                    <p
                      className="my-ad-post-time"
                    >

                      🕒{" "}

                      {formatPostTime(
                        ad.createdAt
                      )}

                    </p>


                    {/* CITY */}

                    {ad.city && (

                      <p>

                        📍{" "}

                        {ad.city}

                      </p>

                    )}


                    {/* CONDITION */}

                    {ad.condition && (

                      <p>

                        🔄{" "}

                        {ad.condition}

                      </p>

                    )}


                    {/* TYPE */}

                    {ad.type && (

                      <p>

                        🏷️{" "}

                        {ad.type}

                      </p>

                    )}


                    {/* PHONE */}

                    {ad.phone && (

                      <p>

                        📞{" "}

                        {ad.phone}

                      </p>

                    )}


                    {/* =========================
                        BUTTONS
                    ========================= */}

                    <div
                      className="my-ad-actions"
                    >


                      <Link
                        to={`/ad/${ad.id}`}
                        className="ad-action-link"
                      >

                        <button
                          className="view-ad-btn"
                        >

                          👁 View

                        </button>

                      </Link>


                      <Link
                        to={`/edit-ad/${ad.id}`}
                        className="ad-action-link"
                      >

                        <button
                          className="edit-ad-btn"
                        >

                          ✏️ Edit

                        </button>

                      </Link>


                      <button
                        className="delete-ad-btn"

                        onClick={() =>
                          deleteAd(
                            ad.id
                          )
                        }
                      >

                        🗑️ Delete

                      </button>

                    </div>

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}

    </div>

  );

}

export default MyAds;