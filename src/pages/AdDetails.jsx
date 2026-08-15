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

          const favoriteSnap = await getDoc(favoriteRef);

          setIsFavorite(favoriteSnap.exists());
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
      alert("Please log in to save advertisements.");
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

        alert("Advertisement removed from favorites.");
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
          materialType: ad.materialType || "",
          savedAt: new Date(),
        });

        setIsFavorite(true);

        alert("Advertisement saved to favorites! ❤️");
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
        <h2>Advertisement not found.</h2>
      </div>
    );
  }

  // =========================
  // IMAGES
  // =========================

  const imageList =
    ad.images && ad.images.length > 0
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

  const phoneNumber = ad.phone || "";

  const whatsappNumber = phoneNumber.replace(
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
              src={imageList[currentImage]}
              alt={ad.title}
              className="details-photo"
            />

            {imageList.length > 1 && (
              <>
                <button
                  className="gallery-button gallery-prev"
                  onClick={previousImage}
                >
                  ❮
                </button>

                <button
                  className="gallery-button gallery-next"
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

          {imageList.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${ad.title} ${index + 1}`}
              className={
                index === currentImage
                  ? "thumbnail active-thumbnail"
                  : "thumbnail"
              }
              onClick={() =>
                setCurrentImage(index)
              }
            />
          ))}

        </div>
      )}

      {/* =========================
          AD INFORMATION
      ========================= */}

      <div className="details-info">

        {/* Category */}

        <span className="details-category">
          {ad.category}
        </span>

        {/* Title */}

        <h1>{ad.title}</h1>

        {/* Price */}

        <h2>
          ETB {ad.price}
        </h2>

        {/* Favorite */}

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

        {/* City */}

        <p>
          <strong>📍 City:</strong>{" "}
          {ad.city}
        </p>

        {/* Condition */}

        {ad.condition && (
          <p>
            <strong>🔄 Condition:</strong>{" "}
            {ad.condition}
          </p>
        )}

        {/* Material */}

        {ad.materialType && (
          <p>
            <strong>🧱 Material Type:</strong>{" "}
            {ad.materialType}
          </p>
        )}

        {/* Description */}

        <p>
          <strong>Description</strong>
        </p>

        <p>{ad.description}</p>

        <hr />

        {/* =========================
            SELLER INFORMATION
        ========================= */}

        <h3>Seller Information</h3>

        {/* PHONE */}

        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className="phone-link"
          >
            📞 Call Seller: {phoneNumber}
          </a>
        )}

        {/* EMAIL */}

        {ad.userEmail && (
          <a
            href={`mailto:${ad.userEmail}?subject=Regarding your advertisement: ${encodeURIComponent(
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