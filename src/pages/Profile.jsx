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
  const [profile, setProfile] =
    useState(null);

  const [ads, setAds] =
    useState([]);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [city, setCity] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // =========================
  // GET TIME
  // =========================

  const getTime = (createdAt) => {
    if (!createdAt) return 0;

    if (
      typeof createdAt.toMillis ===
      "function"
    ) {
      return createdAt.toMillis();
    }

    if (createdAt.seconds) {
      return (
        createdAt.seconds * 1000
      );
    }

    if (createdAt instanceof Date) {
      return createdAt.getTime();
    }

    const time = new Date(
      createdAt
    ).getTime();

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
    const time =
      getTime(createdAt);

    if (!time) {
      return "Recently";
    }

    const difference =
      Date.now() - time;

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = Math.floor(
      difference /
        (1000 * 60 * 60)
    );

    const days = Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} minute${
        minutes !== 1
          ? "s"
          : ""
      } ago`;
    }

    if (hours < 24) {
      return `${hours} hour${
        hours !== 1
          ? "s"
          : ""
      } ago`;
    }

    if (days < 7) {
      return `${days} day${
        days !== 1
          ? "s"
          : ""
      } ago`;
    }

    return new Date(
      time
    ).toLocaleDateString();
  };

  // =========================
  // AUTH
  // =========================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {

          if (!currentUser) {
            navigate("/login");
            return;
          }

          setUser(currentUser);

          await loadProfile(
            currentUser
          );

          await loadUserAds(
            currentUser.uid
          );

          setLoading(false);
        }
      );

    return () =>
      unsubscribe();

  }, [navigate]);


  // =========================
  // LOAD PROFILE
  // =========================

  const loadProfile = async (
    currentUser
  ) => {

    try {

      const profileRef =
        doc(
          db,
          "users",
          currentUser.uid
        );

      const snapshot =
        await getDoc(
          profileRef
        );

      if (snapshot.exists()) {

        const data =
          snapshot.data();

        setProfile(data);

        setName(
          data.name ||
            currentUser.displayName ||
            ""
        );

        setPhone(
          data.phone || ""
        );

        setCity(
          data.city || ""
        );

      } else {

        setName(
          currentUser.displayName ||
            ""
        );

      }

    } catch (error) {

      console.error(
        "Profile loading error:",
        error
      );

    }

  };


  // =========================
  // LOAD USER ADS
  // =========================

  const loadUserAds = async (
    uid
  ) => {

    try {

      const adsQuery =
        query(
          collection(db, "ads"),
          where(
            "userId",
            "==",
            uid
          )
        );

      const snapshot =
        await getDocs(
          adsQuery
        );

      const userAds =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          })
        );

      // NEWEST FIRST

      userAds.sort(
        (a, b) =>
          getTime(
            b.createdAt
          ) -
          getTime(
            a.createdAt
          )
      );

      setAds(userAds);

    } catch (error) {

      console.error(
        "Ads loading error:",
        error
      );

    }

  };


  // =========================
  // SAVE PROFILE
  // =========================

  const saveProfile =
    async (e) => {

      e.preventDefault();

      if (!user) return;

      try {

        setSaving(true);

        const updatedName =
          name.trim();

        const updatedPhone =
          phone.trim();

        const updatedCity =
          city.trim();

        await updateProfile(
          user,
          {
            displayName:
              updatedName,
          }
        );

        // setDoc works even if
        // the user document
        // does not exist yet

        await setDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {
            name:
              updatedName,

            phone:
              updatedPhone,

            city:
              updatedCity,

            email:
              user.email || "",

            updatedAt:
              new Date(),
          },
          {
            merge: true,
          }
        );

        setProfile(
          (current) => ({
            ...current,
            name:
              updatedName,
            phone:
              updatedPhone,
            city:
              updatedCity,
          })
        );

        setUser({
          ...user,
          displayName:
            updatedName,
        });

        alert(
          "Profile updated successfully! ✅"
        );

      } catch (error) {

        console.error(
          "Profile update error:",
          error
        );

        alert(
          error.message ||
            "Could not update profile."
        );

      } finally {

        setSaving(false);

      }

    };


  // =========================
  // LOGOUT
  // =========================

  const handleLogout =
    async () => {

      try {

        await signOut(
          auth
        );

        navigate("/");

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

      }

    };


  // =========================
  // SHARE PROFILE
  // =========================

  const shareProfile =
    async () => {

      if (!user) return;

      const profileUrl =
        `${window.location.origin}${window.location.pathname}#/user/${user.uid}`;

      const shareData = {
        title:
          `${
            name ||
            "User"
          } - የኛ ገበያ`,

        text:
          `View ${
            name ||
            "this user's"
          } profile on የኛ ገበያ.`,

        url:
          profileUrl,
      };

      try {

        if (
          navigator.share
        ) {

          await navigator.share(
            shareData
          );

        } else {

          await navigator.clipboard.writeText(
            profileUrl
          );

          alert(
            "Profile link copied! 🔗"
          );

        }

      } catch (error) {

        console.log(
          "Share cancelled."
        );

      }

    };


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <main className="profile-page">

        <div className="profile-loading">

          Loading profile...

        </div>

      </main>

    );

  }


  // =========================
  // AVATAR
  // =========================

  const avatarLetter =
    name
      ? name
          .charAt(0)
          .toUpperCase()
      : "👤";


  return (

    <main className="profile-page">

      <div className="profile-container">


        {/* =========================
            PROFILE HEADER
        ========================= */}

        <section className="profile-header">

          <div className="profile-avatar">

            {avatarLetter}

          </div>


          <div className="profile-header-info">

            <h1>

              {name ||
                "My Account"}

            </h1>


            <p>

              {user?.email}

            </p>


            <p>

              📍{" "}

              {city ||
                "Location not added"}

            </p>


            <p>

              📢{" "}

              {ads.length} Advertisement
              {ads.length !== 1
                ? "s"
                : ""}

            </p>

          </div>


          <div className="profile-actions">

            <button
              onClick={
                shareProfile
              }
              className="profile-share-button"
            >

              🔗 Share Profile

            </button>


            <button
              onClick={
                handleLogout
              }
              className="profile-logout-button"
            >

              Logout

            </button>

          </div>

        </section>


        {/* =========================
            PROFILE FORM
        ========================= */}

        <section className="profile-section">

          <h2>

            👤 My Profile

          </h2>


          <form
            className="profile-form"
            onSubmit={
              saveProfile
            }
          >

            <label>

              Name

            </label>


            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
            />


            <label>

              Email

            </label>


            <input
              type="email"
              value={
                user?.email || ""
              }
              disabled
            />


            <label>

              Phone

            </label>


            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
            />


            <label>

              City

            </label>


            <input
              type="text"
              value={city}
              onChange={(e) =>
                setCity(
                  e.target.value
                )
              }
            />


            <button
              type="submit"
              disabled={saving}
            >

              {saving
                ? "Saving..."
                : "💾 Save Profile"}

            </button>

          </form>

        </section>


        {/* =========================
            PUBLIC PROFILE
        ========================= */}

        <section className="profile-section">

          <h2>

            🌐 Public Profile

          </h2>


          <p>

            Other people can see your
            profile and advertisements.

          </p>


          <Link
            to={`/user/${user.uid}`}
            className="view-public-profile"
          >

            View My Public Profile →

          </Link>

        </section>


        {/* =========================
            MY ADS
        ========================= */}

        <section className="profile-section">


          <div className="profile-section-heading">

            <div>

              <h2>

                📢 My Advertisements

              </h2>


              <p>

                {ads.length} advertisement
                {ads.length !== 1
                  ? "s"
                  : ""}

              </p>

            </div>


            <Link
              to="/post-ad"
              className="profile-post-button"
            >

              + Post Advertisement

            </Link>

          </div>


          {/* =========================
              NO ADS
          ========================= */}

          {ads.length === 0 ? (

            <div className="profile-empty">

              <h3>

                You haven't posted
                any advertisements yet.

              </h3>


              <Link to="/post-ad">

                📢 Post Your First Ad

              </Link>

            </div>

          ) : (

            /* =========================
                ADS
            ========================= */

            <div className="profile-ads-grid">

              {ads.map((ad) => {

                const adImage =
                  Array.isArray(
                    ad.images
                  ) &&
                  ad.images.length > 0
                    ? ad.images[0]
                    : ad.image;


                return (

                  <Link
                    key={ad.id}
                    to={`/ad/${ad.id}`}
                    className="profile-ad-card"
                  >


                    {/* IMAGE */}

                    <div className="profile-ad-image">

                      {adImage ? (

                        <img
                          src={adImage}
                          alt={
                            ad.title ||
                            "Advertisement"
                          }
                        />

                      ) : (

                        <div>

                          📷

                        </div>

                      )}

                    </div>


                    {/* INFO */}

                    <div className="profile-ad-info">


                      {/* SELLER */}

                      <p className="profile-ad-seller">

                        👤{" "}

                        {ad.userName ||
                          name ||
                          "Seller"}

                      </p>


                      {/* TITLE */}

                      <h3>

                        {ad.title ||
                          "Advertisement"}

                      </h3>


                      {/* PRICE */}

                      <strong>

                        ETB{" "}

                        {Number(
                          String(
                            ad.price || 0
                          ).replace(
                            /,/g,
                            ""
                          )
                        ).toLocaleString(
                          "en-US"
                        )}

                      </strong>


                      {/* CITY */}

                      <p>

                        📍{" "}

                        {ad.city ||
                          "Ethiopia"}

                      </p>


                      {/* POST TIME */}

                      <p className="profile-ad-time">

                        🕒 Posted{" "}

                        {formatPostTime(
                          ad.createdAt
                        )}

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