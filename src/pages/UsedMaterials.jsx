import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";

function UsedMaterials() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "ads")
      );

      const data = snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .filter(
          (ad) => ad.category === "ምንአለሽ ተራ"
        );

      setAds(data);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
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

      <h1>🏪 ምንአለሽ ተራ</h1>

      {ads.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "20px" }}>
          No advertisements found.
        </p>
      ) : (
        <div className="cars-grid">

          {ads.map((ad) => (
            <div className="car-card" key={ad.id}>

              {/* Image */}
              {ad.image ? (
                <img
                  src={ad.image}
                  alt={ad.title}
                />
              ) : (
                <div className="listing-image">
                  📷
                </div>
              )}

              <div className="car-info">

                <span className="category">
                  {ad.category}
                </span>

                <h3>{ad.title}</h3>

                <h2>
                  ETB {ad.price}
                </h2>

                <p>
                  📍 {ad.city}
                </p>

                {ad.condition && (
                  <p>
                    🔄 <strong>Condition:</strong>{" "}
                    {ad.condition}
                  </p>
                )}

                {ad.materialType && (
                  <p>
                    🧱 <strong>Material:</strong>{" "}
                    {ad.materialType}
                  </p>
                )}

                <p>
                  {ad.description}
                </p>

                <Link to={`/ad/${ad.id}`}>
                  <button
                    style={{
                      background: "#2e7d32",
                      color: "white",
                    }}
                  >
                    View Details
                  </button>
                </Link>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default UsedMaterials;