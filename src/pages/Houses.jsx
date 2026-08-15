import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Link } from "react-router-dom";

function Houses() {
  const [houses, setHouses] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHouses();
  }, []);

  const loadHouses = async () => {
    try {
      const snapshot = await getDocs(collection(db, "ads"));

      const houseAds = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .filter((ad) => ad.category === "Houses");

      setHouses(houseAds);
    } catch (error) {
      console.error("Error loading houses:", error);
    }

    setLoading(false);
  };

  // Search houses
  const filteredHouses = houses.filter((house) => {
    const text = search.toLowerCase().trim();

    if (!text) return true;

    return (
      house.title?.toLowerCase().includes(text) ||
      house.city?.toLowerCase().includes(text) ||
      house.description?.toLowerCase().includes(text)
    );
  });

  // Sort houses by price
  const sortedHouses = [...filteredHouses].sort((a, b) => {
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
        <h1>Loading Houses...</h1>
      </div>
    );
  }

  return (
    <div className="cars-page">

      <h1>🏠 Houses for Sale</h1>

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
          placeholder="Search house, city, description..."
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

      {/* Number of results */}
      <p
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "18px",
        }}
      >
        {sortedHouses.length} house(s) found
      </p>

      {/* Houses */}
      <div className="cars-grid">

        {sortedHouses.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              width: "100%",
            }}
          >
            <h2>No houses found.</h2>

            <p>
              Try another search.
            </p>
          </div>
        ) : (
          sortedHouses.map((house) => (

            <div className="car-card" key={house.id}>

              {/* House Image */}
              <div className="listing-image">

                {house.image ? (
                  <img
                    src={house.image}
                    alt={house.title}
                    className="listing-photo"
                  />
                ) : (
                  <div className="no-image">
                    📷 No Image
                  </div>
                )}

              </div>

              {/* House Information */}
              <div className="car-info">

                <span className="category">
                  🏠 Houses
                </span>

                <h3>
                  {house.title}
                </h3>

                <h2>
                  ETB {house.price}
                </h2>

                <p>
                  📍 {house.city}
                </p>

                <p>
                  {house.description}
                </p>

                {/* View Details */}
                <Link to={`/ad/${house.id}`}>
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

export default Houses;