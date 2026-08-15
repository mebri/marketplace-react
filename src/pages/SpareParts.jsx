import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Link } from "react-router-dom";

function SpareParts() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "ads"));

      const partAds = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .filter((ad) => ad.category === "Spare Parts");

      setParts(partAds);
    } catch (error) {
      console.error("Error loading spare parts:", error);
    }

    setLoading(false);
  };

  const filteredParts = parts.filter((part) => {
    const text = search.toLowerCase().trim();

    if (!text) return true;

    return (
      part.title?.toLowerCase().includes(text) ||
      part.city?.toLowerCase().includes(text) ||
      part.description?.toLowerCase().includes(text)
    );
  });

  const sortedParts = [...filteredParts].sort((a, b) => {
    const priceA = Number(a.price) || 0;
    const priceB = Number(b.price) || 0;

    if (sort === "low") return priceA - priceB;
    if (sort === "high") return priceB - priceA;

    return 0;
  });

  if (loading) {
    return (
      <div className="cars-page">
        <h1>Loading Spare Parts...</h1>
      </div>
    );
  }

  return (
    <div className="cars-page">

      <h1>🔧 Spare Parts</h1>

      {/* Search and Sort */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "40px",
        }}
      >
        <input
          className="car-search"
          type="text"
          placeholder="Search spare parts, city..."
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
            outline: "none",
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
        {sortedParts.length} spare part(s) found
      </p>

      <div className="cars-grid">

        {sortedParts.length === 0 ? (
          <div style={{ textAlign: "center", width: "100%" }}>
            <h2>No spare parts found.</h2>
            <p>Try another search.</p>
          </div>
        ) : (
          sortedParts.map((part) => (
            <div className="car-card" key={part.id}>

              {/* Image */}
              <div className="listing-image">
                {part.image ? (
                  <img
                    src={part.image}
                    alt={part.title}
                    className="listing-photo"
                  />
                ) : (
                  <div className="no-image">
                    📷 No Image
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="car-info">

                <span className="category">
                  🔧 Spare Parts
                </span>

                <h3>{part.title}</h3>

                <h2>ETB {part.price}</h2>

                <p>📍 {part.city}</p>

                <p>{part.description}</p>

                <Link to={`/ad/${part.id}`}>
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

export default SpareParts;