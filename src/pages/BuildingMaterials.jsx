import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Link } from "react-router-dom";

function BuildingMaterials() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const snapshot = await getDocs(collection(db, "ads"));

      const materialAds = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .filter((ad) => ad.category === "Building Materials");

      setMaterials(materialAds);
    } catch (error) {
      console.error("Error loading building materials:", error);
    }

    setLoading(false);
  };

  // Search
  const filteredMaterials = materials.filter((material) => {
    const text = search.toLowerCase().trim();

    if (!text) return true;

    return (
      material.title?.toLowerCase().includes(text) ||
      material.city?.toLowerCase().includes(text) ||
      material.description?.toLowerCase().includes(text)
    );
  });

  // Sort by price
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    const priceA = Number(a.price) || 0;
    const priceB = Number(b.price) || 0;

    if (sort === "low") {
      return priceA - priceB;
    }

    if (sort === "high") {
      return priceB - priceA;
    }

    return 0;
  });

  if (loading) {
    return (
      <div className="cars-page">
        <h1>Loading Building Materials...</h1>
      </div>
    );
  }

  return (
    <div className="cars-page">

      <h1>🧱 Building Materials</h1>

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
          placeholder="Search materials, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            margin: 0,
          }}
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
          <option value="default">
            Sort by Price
          </option>

          <option value="low">
            Price: Low → High
          </option>

          <option value="high">
            Price: High → Low
          </option>
        </select>
      </div>

      {/* Results count */}
      <p
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "18px",
        }}
      >
        {sortedMaterials.length} material(s) found
      </p>

      {/* Materials */}
      <div className="cars-grid">

        {sortedMaterials.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              width: "100%",
            }}
          >
            <h2>No building materials found.</h2>

            <p>
              Try another search.
            </p>
          </div>
        ) : (
          sortedMaterials.map((material) => (

            <div
              className="car-card"
              key={material.id}
            >

              {/* Image */}
              <div className="listing-image">

                {material.image ? (
                  <img
                    src={material.image}
                    alt={material.title}
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
                  🧱 Building Materials
                </span>

                <h3>
                  {material.title}
                </h3>

                <h2>
                  ETB {material.price}
                </h2>

                <p>
                  📍 {material.city}
                </p>

                <p>
                  {material.description}
                </p>

                {/* View Details */}
                <Link to={`/ad/${material.id}`}>
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

export default BuildingMaterials;