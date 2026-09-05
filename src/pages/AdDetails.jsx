import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
} from "firebase/firestore";

import { db, auth } from "../firebase/firebase";

function AdDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ad, setAd] = useState(null);
  const [loading, setLoading] =
    useState(true);

  // Favorite
  const [isFavorite, setIsFavorite] =
    useState(false);

  const [
    favoriteLoading,
    setFavoriteLoading,
  ] = useState(false);

  // Chat
  const [chatLoading, setChatLoading] =
    useState(false);

  // Images
  const [
    currentImage,
    setCurrentImage,
  ] = useState(0);

  // =========================
  // LOAD ADVERTISEMENT
  // =========================

  useEffect(() => {
    loadAd();
  }, [id]);

  const loadAd = async () => {
    try {
      const docRef = doc(
        db,
        "ads",
        id
      );

      const docSnap =
        await getDoc(docRef);

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
        await setDoc(
          favoriteRef,
          {
            adId: id,

            title:
              ad.title || "",

            price:
              ad.price || "",

            city:
              ad.city || "",

            category:
              ad.category || "",

            description:
              ad.description || "",

            image:
              ad.image || "",

            images:
              ad.images || [],

            phone:
              ad.phone || "",

            whatsapp:
              ad.whatsapp || "",

            telegram:
              ad.telegram || "",

            userEmail:
              ad.userEmail || "",

            condition:
              ad.condition || "",

            savedAt:
              new Date(),
          }
        );

        setIsFavorite(true);

        alert(
          "Advertisement saved to favorites! ❤️"
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Could not save advertisement."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // =========================
  // CHAT WITH SELLER
  // =========================

  const startChat = async () => {
    if (!auth.currentUser) {
      alert(
        "Please log in to chat with the seller."
      );

      navigate("/login");

      return;
    }

    if (!ad) return;

    // Prevent seller from chatting with themselves
    if (
      ad.userId ===
      auth.currentUser.uid
    ) {
      alert(
        "This is your advertisement. You cannot chat with yourself."
      );

      return;
    }

    try {
      setChatLoading(true);

      const buyerId =
        auth.currentUser.uid;

      const sellerId =
        ad.userId;

      if (!sellerId) {
        alert(
          "Seller information is not available."
        );

        return;
      }

      // Create a consistent chat ID
      const chatId =
        buyerId < sellerId
          ? `${buyerId}_${sellerId}_${id}`
          : `${sellerId}_${buyerId}_${id}`;

      const chatRef = doc(
        db,
        "chats",
        chatId
      );

      // Check if chat already exists
      const chatSnap =
        await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [
            buyerId,
            sellerId,
          ],

          buyerId,
          sellerId,

          adId: id,

          adTitle:
            ad.title || "",

          adImage:
            Array.isArray(ad.images) &&
            ad.images.length > 0
              ? ad.images[0]
              : ad.image || "",

          createdAt:
            new Date(),

          updatedAt:
            new Date(),

          lastMessage:
            "",
        });

        // =========================
        // CREATE NOTIFICATION
        // =========================

        await addDoc(
          collection(
            db,
            "users",
            sellerId,
            "notifications"
          ),
          {
            type: "chat",

            title:
              "New chat request 💬",

            message:
              `Someone wants to chat with you about "${ad.title}".`,

            adId: id,

            chatId,

            fromUserId:
              buyerId,

            read: false,

            createdAt:
              new Date(),
          }
        );
      }

      // Open chat
      navigate(`/chat/${chatId}`);

    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      alert(
        error.message ||
          "Could not start chat."
      );
    } finally {
      setChatLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="details-page">
        <h2>
          Loading...
        </h2>
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

        <Link to="/">
          ← Back Home
        </Link>
      </div>
    );
  }

  // =========================
  // IMAGE LIST
  // =========================

  const imageList =
    ad.images &&
    ad.images.length > 0
      ? ad.images
      : ad.image
      ? [ad.image]
      : [];

  // =========================
  // NEXT IMAGE
  // =========================

  const nextImage = () => {
    if (
      imageList.length === 0
    ) {
      return;
    }

    setCurrentImage(
      (current) =>
        current ===
        imageList.length - 1
          ? 0
          : current + 1
    );
  };

  // =========================
  // PREVIOUS IMAGE
  // =========================

  const previousImage = () => {
    if (
      imageList.length === 0
    ) {
      return;
    }

    setCurrentImage(
      (current) =>
        current === 0
          ? imageList.length - 1
          : current - 1
    );
  };

  // =========================
  // CONTACT INFORMATION
  // =========================

  const phoneNumber =
    ad.phone || "";

  const whatsappNumber =
    (
      ad.whatsapp ||
      phoneNumber ||
      ""
    ).replace(
      /\D/g,
      ""
    );

  const telegramValue =
    ad.telegram || "";

  const telegramUsername =
    telegramValue
      .trim()
      .replace("@", "");

  // =========================
  // POSTED TIME
  // =========================

  const getPostedTime = () => {
    if (!ad.createdAt) {
      return "";
    }

    let date;

    if (
      typeof ad.createdAt.toDate ===
      "function"
    ) {
      date =
        ad.createdAt.toDate();

    } else if (
      ad.createdAt.seconds
    ) {
      date = new Date(
        ad.createdAt.seconds * 1000
      );

    } else {
      date =
        new Date(ad.createdAt);
    }

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleString();
  };

  const postedTime =
    getPostedTime();

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
                imageList[
                  currentImage
                ]
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
                  onClick={
                    previousImage
                  }
                >
                  ❮
                </button>

                <button
                  className="
                    gallery-button
                    gallery-next
                  "
                  onClick={
                    nextImage
                  }
                >
                  ❯
                </button>

                <div
                  className="
                    image-counter
                  "
                >
                  {currentImage + 1}
                  {" / "}
                  {imageList.length}
                </div>

              </>

            )}

          </>

        ) : (

          <div
            className="
              no-details-image
            "
          >
            📷 No Image Available
          </div>

        )}

      </div>

      {/* =========================
          THUMBNAILS
      ========================= */}

      {imageList.length > 1 && (

        <div
          className="
            image-thumbnails
          "
        >

          {imageList.map(
            (image, index) => (

              <img
                key={index}
                src={image}
                alt={
                  `${ad.title} ${
                    index + 1
                  }`
                }
                className={
                  index ===
                  currentImage
                    ? "thumbnail active-thumbnail"
                    : "thumbnail"
                }
                onClick={() =>
                  setCurrentImage(
                    index
                  )
                }
              />

            )
          )}

        </div>

      )}

      {/* =========================
          AD INFORMATION
      ========================= */}

      <div
        className="
          details-info
        "
      >

        {/* CATEGORY */}

        <span
          className="
            details-category
          "
        >
          {ad.category ||
            "Advertisement"}
        </span>

        {/* TITLE */}

        <h1>
          {ad.title ||
            "Untitled Advertisement"}
        </h1>

        {/* PRICE */}

        <h2>

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

        </h2>

        {/* POST TIME */}

        {postedTime && (

          <p
            className="
              posted-time
            "
          >
            🕒 Posted:
            {" "}
            {postedTime}
          </p>

        )}

        {/* FAVORITE */}

        <button
          onClick={
            toggleFavorite
          }
          disabled={
            favoriteLoading
          }
          className="
            favorite-btn
          "
        >

          {favoriteLoading
            ? "Saving..."
            : isFavorite
            ? "❤️ Saved"
            : "🤍 Save Advertisement"}

        </button>

        {/* =========================
            CHAT
        ========================= */}

        {ad.userId !==
          auth.currentUser?.uid && (

          <button
            onClick={
              startChat
            }
            disabled={
              chatLoading
            }
            className="
              chat-seller-btn
            "
          >

            {chatLoading
              ? "Opening chat..."
              : "💬 Chat with Seller"}

          </button>

        )}

        {/* CITY */}

        {ad.city && (

          <p>

            <strong>
              📍 City:
            </strong>

            {" "}

            {ad.city}

          </p>

        )}

        {/* CONDITION */}

        {ad.condition && (

          <p>

            <strong>
              🔄 Condition:
            </strong>

            {" "}

            {ad.condition}

          </p>

        )}

        {/* SUBCATEGORY */}

        {ad.subcategory && (

          <p>

            <strong>
              📂 Type:
            </strong>

            {" "}

            {ad.subcategory}

          </p>

        )}

        {/* FURNITURE */}

        {ad.furnitureType && (

          <p>

            <strong>
              🛋️ Furniture:
            </strong>

            {" "}

            {
              ad.furnitureType
            }

          </p>

        )}

        {/* LABOR */}

        {ad.laborType && (

          <p>

            <strong>
              👷 Service:
            </strong>

            {" "}

            {
              ad.laborType
            }

          </p>

        )}

        {/* DESCRIPTION */}

        <div
          className="
            details-description
          "
        >

          <h3>
            Description
          </h3>

          <p>

            {
              ad.description ||
              "No description available."
            }

          </p>

        </div>

        <hr />

        {/* =========================
            SELLER INFORMATION
        ========================= */}

        <div
          className="
            seller-information
          "
        >

          <h3>
            👤 Seller Information
          </h3>

          {/* PHONE */}

          {phoneNumber && (

            <a
              href={
                `tel:${phoneNumber}`
              }
              className="
                phone-link
              "
            >

              📞 Call Seller

              <span>
                {phoneNumber}
              </span>

            </a>

          )}

          {/* WHATSAPP */}

          {whatsappNumber && (

            <a
              href={
                `https://wa.me/${whatsappNumber}`
              }
              target="_blank"
              rel="
                noopener noreferrer
              "
              className="
                whatsapp-btn
              "
            >

              💬 WhatsApp Seller

            </a>

          )}

          {/* TELEGRAM */}

          {telegramUsername && (

            <a
              href={
                `https://t.me/${telegramUsername}`
              }
              target="_blank"
              rel="
                noopener noreferrer
              "
              className="
                telegram-btn
              "
            >

              ✈️ Contact on Telegram

            </a>

          )}

          {/* EMAIL */}

          {ad.userEmail && (

            <a
              href={
                `mailto:${
                  ad.userEmail
                }?subject=${encodeURIComponent(
                  `Regarding your advertisement: ${
                    ad.title ||
                    ""
                  }`
                )}`
              }
              className="
                contact-btn
              "
            >

              📧 Email Seller

            </a>

          )}

          {/* NO CONTACT */}

          {!phoneNumber &&
            !whatsappNumber &&
            !telegramUsername &&
            !ad.userEmail && (

              <p>
                Seller contact
                information is not
                available.
              </p>

            )}

        </div>

      </div>

    </div>
  );
}

export default AdDetails;