import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Link } from "react-router-dom";

function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      const snapshot = await getDocs(collection(db, "ads"));

      const rentalAds = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .filter((ad) => ad.category === "Rentals");

      setRentals(rentalAds);
    } catch (error) {
      console.error("Error loading rentals:", error);
    }

    setLoading(false);
  };

  // Search rentals
  const filteredRentals = rentals.filter((rental) => {
    const text = search.toLowerCase().trim();

    if (!text) return true;

    return (
      rental.title?.toLowerCase().includes(text) ||
      rental.city?.toLowerCase().includes(text) ||
      rental.description?.toLowerCase().includes(text)
    );
  });

  // Sort rentals by price
  const sortedRentals = [...filteredRentals].sort((a, b) => {
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
        <h1>Loading Rentals...</h1>
      </div>
    );
  }

  return (
    <div className="cars-page">

      <h1>🏢 Properties for Rent</h1>

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
          placeholder="Search rental, city, description..."
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
        {sortedRentals.length} rental(s) found
      </p>

      {/* Rentals */}
      <div className="cars-grid">

        {sortedRentals.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              width: "100%",
            }}
          >
            <h2>No rentals found.</h2>

            <p>
              Try another search.
            </p>
          </div>
        ) : (
          sortedRentals.map((rental) => (

            <div className="car-card" key={rental.id}>

              {/* Rental Image */}
              <div className="listing-image">

                {rental.image ? (
                  <img
                    src={rental.image}
                    alt={rental.title}
                    className="listing-photo"
                  />
                ) : (
                  <div className="no-image">
                    📷 No Image
                  </div>
                )}

              </div>

              {/* Rental Information */}
              <div className="car-info">

                <span className="category">
                  🏢 Rentals
                </span>

                <h3>
                  {rental.title}
                </h3>

                <h2>
                  ETB {rental.price}
                </h2>

                <p>
                  📍 {rental.city}
                </p>

                <p>
                  {rental.description}
                </p>

                {/* View Details */}
                <Link to={`/ad/${rental.id}`}>
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

export default Rentals;