import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Link } from "react-router-dom";

function MinAleshTera() {
  const [ads, setAds] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const snapshot = await getDocs(collection(db, "ads"));

      const data = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .filter((ad) => ad.category === "ምንአለሽ ተራ");

      setAds(data);
    } catch (error) {
      console.error("Error loading ምንአለሽ ተራ:", error);
    }

    setLoading(false);
  };

  const filteredAds = ads.filter((ad) => {
    const text = search.toLowerCase().trim();

    if (!text) return true;

    return (
      ad.title?.toLowerCase().includes(text) ||
      ad.city?.toLowerCase().includes(text) ||
      ad.description?.toLowerCase().includes(text)
    );
  });

  const sortedAds = [...filteredAds].sort((a, b) => {
    const priceA = Number(a.price) || 0;
    const priceB = Number(b.price) || 0;

    if (sort === "low") return priceA - priceB;
    if (sort === "high") return priceB - priceA;

    return 0;
  });

  if (loading) {
    return (
      <div className="cars-page">
        <h1>🏪 ምንአለሽ ተራ</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="cars-page">

      <h1>🏪 ምንአለሽ ተራ</h1>

      <p
        style={{
          textAlign: "center",
          fontSize: "20px",
          marginBottom: "30px",
        }}
      >
        Used and reusable materials
      </p>

      <div
        style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "40px",
        }}
      >
        <input
          className="car-search"
          type="text"
          placeholder="Search used materials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ margin: 0 }}
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: "15px",
            fontSize: "17px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <option value="default">Sort by Price</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
        </select>
      </div>

      <p
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "18px",
        }}
      >
        {sortedAds.length} item(s) found
      </p>

      <div className="cars-grid">

        {sortedAds.length === 0 ? (
          <div style={{ textAlign: "center", width: "100%" }}>
            <h2>No used materials found.</h2>
            <p>Try another search.</p>
          </div>
        ) : (
          sortedAds.map((ad) => (
            <div className="car-card" key={ad.id}>

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

              <div className="car-info">

                <span className="category">
                  🏪 ምንአለሽ ተራ
                </span>

                <h3>{ad.title}</h3>

                <h2>ETB {ad.price}</h2>

                <p>📍 {ad.city}</p>

{ad.condition && (
  <p>
    🔄 <strong>Condition:</strong> {ad.condition}
  </p>
)}

{ad.materialType && (
  <p>
    🧱 <strong>Material:</strong> {ad.materialType}
  </p>
)}

<p>{ad.description}</p>

                

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

              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default MinAleshTera;