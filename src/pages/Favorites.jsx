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

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        const favoritesRef = collection(
          db,
          "users",
          user.uid,
          "favorites"
        );

        const snapshot = await getDocs(favoritesRef);

        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setFavorites(data);
      } catch (error) {
        console.error(error);
        alert(error.message);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const removeFavorite = async (id) => {
    if (!auth.currentUser) return;

    try {
      await deleteDoc(
        doc(
          db,
          "users",
          auth.currentUser.uid,
          "favorites",
          id
        )
      );

      setFavorites((current) =>
        current.filter((favorite) => favorite.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <h2>Loading favorites...</h2>
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="favorites-page">
        <h1>❤️ My Favorites</h1>
        <p>Please log in to see your saved advertisements.</p>
        <Link to="/login">
          <button className="favorite-login-btn">
            Login
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="favorites-page">

      <h1>❤️ My Favorites</h1>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <h2>No saved advertisements yet.</h2>

          <p>
            When you save an advertisement, it will
            appear here.
          </p>

          <Link to="/">
            <button className="browse-btn">
              Browse Advertisements
            </button>
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">

          {favorites.map((favorite) => (
            <div
              className="favorite-card"
              key={favorite.id}
            >

              {/* Image */}

              <div className="favorite-image">

                {favorite.image ? (
                  <img
                    src={favorite.image}
                    alt={favorite.title}
                  />
                ) : (
                  <div className="favorite-no-image">
                    📷
                  </div>
                )}

              </div>

              {/* Information */}

              <div className="favorite-info">

                <span className="category">
                  {favorite.category}
                </span>

                <h2>{favorite.title}</h2>

                <h3>
                  ETB {favorite.price}
                </h3>

                <p>
                  📍 {favorite.city}
                </p>

                {/* Buttons */}

                <Link to={`/ad/${favorite.adId}`}>
                  <button className="favorite-view-btn">
                    View Details
                  </button>
                </Link>

                <button
                  className="favorite-remove-btn"
                  onClick={() =>
                    removeFavorite(favorite.id)
                  }
                >
                  🗑 Remove Favorite
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Favorites;