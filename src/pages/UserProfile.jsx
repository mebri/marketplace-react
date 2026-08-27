import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

function UserProfile() {
  const { uid } = useParams();

  const [profile, setProfile] =
    useState(null);

  const [ads, setAds] = useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadUser();
  }, [uid]);

  const loadUser = async () => {

    try {

      // Load user profile
      const userRef = doc(
        db,
        "users",
        uid
      );

      const userSnapshot =
        await getDoc(userRef);

      if (
        !userSnapshot.exists()
      ) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(
        userSnapshot.data()
      );

      // Load user's ads
      const adsQuery =
        query(
          collection(db, "ads"),
          where(
            "userId",
            "==",
            uid
          )
        );

      const adsSnapshot =
        await getDocs(
          adsQuery
        );

      const userAds =
        adsSnapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          })
        );

      setAds(userAds);

    } catch (error) {

      console.error(
        "Public profile error:",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  const shareProfile =
    async () => {

      const profileUrl =
        window.location.href;

      const shareData = {
        title:
          `${profile?.name || "User"} - የኛ ገበያ`,

        text:
          `View ${profile?.name || "this user's"} profile on የኛ ገበያ.`,

        url: profileUrl,
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

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="profile-page">

        <div className="profile-not-found">

          <h1>
            User Not Found
          </h1>

          <p>
            This profile does not exist
            or has been removed.
          </p>

          <Link to="/">
            ← Back Home
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="profile-page">

      <div className="profile-container">

        {/* PUBLIC HEADER */}

        <section className="profile-header public-profile-header">

          <div className="profile-avatar">

            {profile.name
              ? profile.name
                  .charAt(0)
                  .toUpperCase()
              : "👤"}

          </div>

          <div className="profile-header-info">

            <h1>
              {profile.name ||
                "የኛ ገበያ User"}
            </h1>

            {profile.city && (
              <p>
                📍 {profile.city}
              </p>
            )}

            <p>
              📢 {ads.length} advertisement
              {ads.length !== 1
                ? "s"
                : ""}
            </p>

          </div>

          <button
            onClick={
              shareProfile
            }
            className="profile-share-button"
          >
            🔗 Share Profile
          </button>

        </section>

        {/* CONTACT */}

        <section className="profile-section">

          <h2>
            👤 About This Seller
          </h2>

          {profile.phone && (
            <p className="public-profile-detail">
              📞{" "}
              <a
                href={`tel:${profile.phone}`}
              >
                {profile.phone}
              </a>
            </p>
          )}

          {profile.city && (
            <p className="public-profile-detail">
              📍 {profile.city}
            </p>
          )}

        </section>

        {/* ADS */}

        <section className="profile-section">

          <h2>
            📢 Advertisements
          </h2>

          {ads.length === 0 ? (

            <div className="profile-empty">

              <h3>
                No advertisements yet.
              </h3>

            </div>

          ) : (

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

                    <div className="profile-ad-info">

                      <span>
                        {ad.category ||
                          "Advertisement"}
                      </span>

                      <h3>
                        {ad.title ||
                          "Advertisement"}
                      </h3>

                      <strong>
                        ETB{" "}
                        {Number(
                          ad.price || 0
                        ).toLocaleString(
                          "en-US"
                        )}
                      </strong>

                      <p>
                        📍{" "}
                        {ad.city ||
                          "Ethiopia"}
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

export default UserProfile;