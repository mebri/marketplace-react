import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Link } from "react-router-dom";

function Cars() {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const snapshot = await getDocs(collection(db, "ads"));

      const carAds = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .filter((ad) => ad.category === "Cars");

      setCars(carAds);
    } catch (error) {
      console.error("Error loading cars:", error);
    }

    setLoading(false);
  };

  // Search cars
  const filteredCars = cars.filter((car) => {
    const text = search.toLowerCase().trim();

    if (!text) return true;

    return (
      car.title?.toLowerCase().includes(text) ||
      car.city?.toLowerCase().includes(text) ||
      car.description?.toLowerCase().includes(text)
    );
  });

  // Sort cars by price
  const sortedCars = [...filteredCars].sort((a, b) => {
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
        <h1>Loading Cars...</h1>
      </div>
    );
  }

  return (
    <div className="cars-page">

      <h1>🚗 Cars for Sale</h1>

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
          placeholder="Search car, city, description..."
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
        {sortedCars.length} car(s) found
      </p>

      {/* Cars */}
      <div className="cars-grid">

        {sortedCars.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              width: "100%",
            }}
          >
            <h2>No cars found.</h2>

            <p>
              Try another search.
            </p>
          </div>
        ) : (
          sortedCars.map((car) => (

            <div className="car-card" key={car.id}>

              {/* Car Image */}
              <div className="listing-image">

                {car.image ? (
                  <img
                    src={car.image}
                    alt={car.title}
                    className="listing-photo"
                  />
                ) : (
                  <div className="no-image">
                    📷 No Image
                  </div>
                )}

              </div>

              {/* Car Information */}
              <div className="car-info">

                <span className="category">
                  🚗 Cars
                </span>

                <h3>
                  {car.title}
                </h3>

                <h2>
                  ETB {car.price}
                </h2>

                <p>
                  📍 {car.city}
                </p>

                <p>
                  {car.description}
                </p>

                {/* View Details */}
                <Link to={`/ad/${car.id}`}>
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

export default Cars;