import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

import { db, auth } from "../firebase/firebase";

function AdDetails() {
  const { id } = useParams();

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Image state
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    loadAd();
  }, [id]);

  // =========================
  // LOAD ADVERTISEMENT
  // =========================

  const loadAd = async () => {
    try {
      const docRef = doc(db, "ads", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const adData = {
          id: docSnap.id,
          ...docSnap.data(),
        };

        setAd(adData);

        // Check favorite
        if (auth.currentUser) {
          const favoriteRef = doc(
            db,
            "users",
            auth.currentUser.uid,
            "favorites",
            id
          );

          const favoriteSnap =
            await getDoc(favoriteRef);

          setIsFavorite(
            favoriteSnap.exists()
          );
        }
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // =========================
  // FAVORITE
  // =========================

  const toggleFavorite = async () => {
    if (!auth.currentUser) {
      alert(
        "Please log in to save advertisements."
      );
      return;
    }

    if (!ad) return;

    try {
      setFavoriteLoading(true);

      const favoriteRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "favorites",
        id
      );

      if (isFavorite) {
        await deleteDoc(favoriteRef);

        setIsFavorite(false);

        alert(
          "Advertisement removed from favorites."
        );
      } else {
        await setDoc(favoriteRef, {
          adId: id,
          title: ad.title,
          price: ad.price,
          city: ad.city,
          category: ad.category,
          description: ad.description,
          image: ad.image || "",
          phone: ad.phone || "",
          userEmail: ad.userEmail || "",
          condition: ad.condition || "",
          materialType:
            ad.materialType || "",
          savedAt: new Date(),
        });

        setIsFavorite(true);

        alert(
          "Advertisement saved to favorites! ❤️"
        );
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="details-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  // =========================
  // NOT FOUND
  // =========================

  if (!ad) {
    return (
      <div className="details-page">
        <h2>
          Advertisement not found.
        </h2>
      </div>
    );
  }

  // =========================
  // POST TIME
  // =========================

  const getPostedTime = () => {
    if (!ad.createdAt) {
      return "";
    }

    let postedDate;

    // Firebase Timestamp
    if (
      typeof ad.createdAt.toDate ===
      "function"
    ) {
      postedDate =
        ad.createdAt.toDate();
    }

    // Old JavaScript Date
    else if (
      ad.createdAt instanceof Date
    ) {
      postedDate = ad.createdAt;
    }

    // Firestore seconds format
    else if (ad.createdAt.seconds) {
      postedDate = new Date(
        ad.createdAt.seconds * 1000
      );
    }

    // Other date formats
    else {
      postedDate = new Date(
        ad.createdAt
      );
    }

    // Invalid date
    if (
      Number.isNaN(
        postedDate.getTime()
      )
    ) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      postedDate.getTime();

    const seconds =
      Math.floor(
        difference / 1000
      );

    const minutes =
      Math.floor(
        seconds / 60
      );

    const hours =
      Math.floor(
        minutes / 60
      );

    const days =
      Math.floor(
        hours / 24
      );

    // Just now
    if (seconds < 60) {
      return "Just now";
    }

    // Minutes
    if (minutes < 60) {
      return `${minutes} minute${
        minutes === 1 ? "" : "s"
      } ago`;
    }

    // Hours
    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? "" : "s"
      } ago`;
    }

    // Days
    if (days < 7) {
      return `${days} day${
        days === 1 ? "" : "s"
      } ago`;
    }

    // Older advertisements
    return postedDate.toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // IMAGES
  // =========================

  const imageList =
    ad.images &&
    ad.images.length > 0
      ? ad.images
      : ad.image
      ? [ad.image]
      : [];

  const nextImage = () => {
    if (imageList.length === 0) return;

    setCurrentImage((current) =>
      current === imageList.length - 1
        ? 0
        : current + 1
    );
  };

  const previousImage = () => {
    if (imageList.length === 0) return;

    setCurrentImage((current) =>
      current === 0
        ? imageList.length - 1
        : current - 1
    );
  };

  // =========================
  // PHONE
  // =========================

  const phoneNumber =
    ad.phone || "";

  const whatsappNumber =
    phoneNumber.replace(
      /\D/g,
      ""
    );

  return (
    <div className="details-page">

      {/* =========================
          IMAGE
      ========================= */}

      <div className="details-image">

        {imageList.length > 0 ? (
          <>
            <img
              src={
                imageList[currentImage]
              }
              alt={ad.title}
              className="details-photo"
            />

            {imageList.length > 1 && (
              <>
                <button
                  className="
                    gallery-button
                    gallery-prev
                  "
                  onClick={previousImage}
                >
                  ❮
                </button>

                <button
                  className="
                    gallery-button
                    gallery-next
                  "
                  onClick={nextImage}
                >
                  ❯
                </button>

                <div className="image-counter">
                  {currentImage + 1} /{" "}
                  {imageList.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="no-details-image">
            📷 No Image Available
          </div>
        )}

      </div>

      {/* =========================
          THUMBNAILS
      ========================= */}

      {imageList.length > 1 && (
        <div className="image-thumbnails">

          {imageList.map(
            (image, index) => (
              <img
                key={index}
                src={image}
                alt={`${ad.title} ${
                  index + 1
                }`}
                className={
                  index === currentImage
                    ? "thumbnail active-thumbnail"
                    : "thumbnail"
                }
                onClick={() =>
                  setCurrentImage(index)
                }
              />
            )
          )}

        </div>
      )}

      {/* =========================
          AD INFORMATION
      ========================= */}

      <div className="details-info">

        {/* POST TIME - FIRST */}

        {getPostedTime() && (
          <p className="posted-time">
            🕒 Posted{" "}
            {getPostedTime()}
          </p>
        )}

        {/* CATEGORY */}

        <span className="details-category">
          {ad.category}
        </span>

        {/* TITLE */}

        <h1>{ad.title}</h1>

        {/* PRICE */}

        <h2>
          ETB {ad.price}
        </h2>

        {/* FAVORITE */}

        <button
          onClick={toggleFavorite}
          disabled={favoriteLoading}
          className="favorite-btn"
        >
          {favoriteLoading
            ? "Saving..."
            : isFavorite
            ? "❤️ Saved"
            : "🤍 Save Advertisement"}
        </button>

        {/* CITY */}

        <p>
          <strong>
            📍 City:
          </strong>{" "}
          {ad.city}
        </p>

        {/* CONDITION */}

        {ad.condition && (
          <p>
            <strong>
              🔄 Condition:
            </strong>{" "}
            {ad.condition}
          </p>
        )}

        {/* TYPE */}

        {ad.type && (
          <p>
            <strong>
              🏷️ Type:
            </strong>{" "}
            {ad.type}
          </p>
        )}

        {/* SUBCATEGORY */}

        {ad.subcategory && (
          <p>
            <strong>
              📦 Category Type:
            </strong>{" "}
            {ad.subcategory}
          </p>
        )}

        {/* FURNITURE TYPE */}

        {ad.furnitureType && (
          <p>
            <strong>
              🛋️ Furniture Type:
            </strong>{" "}
            {ad.furnitureType}
          </p>
        )}

        {/* LABOR TYPE */}

        {ad.laborType && (
          <p>
            <strong>
              👷 Service:
            </strong>{" "}
            {ad.laborType}
          </p>
        )}

        {/* MATERIAL */}

        {ad.materialType && (
          <p>
            <strong>
              🧱 Material Type:
            </strong>{" "}
            {ad.materialType}
          </p>
        )}

        {/* DESCRIPTION */}

        <p>
          <strong>
            Description
          </strong>
        </p>

        <p>
          {ad.description}
        </p>

        <hr />

        {/* =========================
            SELLER INFORMATION
        ========================= */}

        <h3>
          Seller Information
        </h3>

        {/* PHONE */}

        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className="phone-link"
          >
            📞 Call Seller:{" "}
            {phoneNumber}
          </a>
        )}

        {/* EMAIL */}

        {ad.userEmail && (
          <a
            href={`mailto:${
              ad.userEmail
            }?subject=Regarding your advertisement: ${encodeURIComponent(
              ad.title
            )}`}
            className="contact-btn"
          >
            📧 Email Seller
          </a>
        )}

        {/* WHATSAPP */}

        {phoneNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-btn"
          >
            📱 WhatsApp Seller
          </a>
        )}

      </div>

    </div>
  );
}

export default AdDetails;