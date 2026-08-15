import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase/firebase";

function MyAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAds([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "ads"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const myAds = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setAds(myAds);
      } catch (error) {
        console.error(error);
        alert(error.message);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const deleteAd = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this advertisement?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "ads", id));

      setAds((currentAds) =>
        currentAds.filter((ad) => ad.id !== id)
      );

      alert("Advertisement deleted successfully!");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="cars-page">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="cars-page">

      <h1>My Advertisements</h1>

      <div className="cars-grid">

        {ads.length === 0 ? (
          <p>You haven't posted any advertisements yet.</p>
        ) : (
          ads.map((ad) => (

            <div className="car-card" key={ad.id}>

              {/* Advertisement Image */}
              <div className="listing-image">

                {ad.image ? (
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="listing-photo"
                  />
                ) : (
                  <div className="no-image">
                    📷 No Image
                  </div>
                )}

              </div>

              {/* Advertisement Information */}
              <div className="car-info">

                <span className="category">
                  {ad.category}
                </span>

                <h3>{ad.title}</h3>

                <h2>ETB {ad.price}</h2>

                <p>📍 {ad.city}</p>

                <p>{ad.description}</p>

                {/* View Details */}
                <Link to={`/ad/${ad.id}`}>
                  <button
                    style={{
                      background: "#2e7d32",
                      color: "white",
                      border: "none",
                      padding: "12px",
                      width: "100%",
                      borderRadius: "8px",
                      cursor: "pointer",
                      marginTop: "10px",
                      fontSize: "16px",
                    }}
                  >
                    👁 View Details
                  </button>
                </Link>

                {/* Edit */}
                <Link to={`/edit-ad/${ad.id}`}>
                  <button
                    style={{
                      background: "#ff9800",
                      color: "white",
                      border: "none",
                      padding: "12px",
                      width: "100%",
                      borderRadius: "8px",
                      cursor: "pointer",
                      marginTop: "10px",
                      fontSize: "16px",
                    }}
                  >
                    ✏️ Edit Advertisement
                  </button>
                </Link>

                {/* Delete */}
                <button
                  onClick={() => deleteAd(ad.id)}
                  style={{
                    background: "#d32f2f",
                    color: "white",
                    border: "none",
                    padding: "12px",
                    width: "100%",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginTop: "10px",
                    fontSize: "16px",
                  }}
                >
                  🗑 Delete Advertisement
                </button>

              </div>
            </div>

          ))
        )}

      </div>
    </div>
  );
}

export default MyAds;