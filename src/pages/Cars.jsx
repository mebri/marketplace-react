import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import {
  Link,
  useSearchParams,
} from "react-router-dom";
import { db } from "../firebase/firebase";

function Cars() {
  const [searchParams] = useSearchParams();

  const selectedCondition =
    searchParams.get("condition") || "";

  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "ads")
      );

      const carAds = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .filter(
          (ad) => ad.category === "Cars"
        );

      setCars(carAds);
    } catch (error) {
      console.error(
        "Error loading cars:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CONDITION FILTER
  // =========================

  const conditionFilteredCars =
    cars.filter((car) => {
      if (!selectedCondition) {
        return true;
      }

      return (
        car.condition?.toLowerCase() ===
        selectedCondition.toLowerCase()
      );
    });

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredCars =
    conditionFilteredCars.filter((car) => {
      const text =
        search.toLowerCase().trim();

      if (!text) {
        return true;
      }

      return (
        car.title
          ?.toLowerCase()
          .includes(text) ||
        car.city
          ?.toLowerCase()
          .includes(text) ||
        car.description
          ?.toLowerCase()
          .includes(text)
      );
    });

  // =========================
  // SORT
  // =========================

  const sortedCars = [
    ...filteredCars,
  ].sort((a, b) => {
    const priceA =
      Number(a.price) || 0;

    const priceB =
      Number(b.price) || 0;

    if (sort === "low") {
      return priceA - priceB;
    }

    if (sort === "high") {
      return priceB - priceA;
    }

    return 0;
  });

  // =========================
  // PAGE TITLE
  // =========================

  let pageTitle = "🚗 Cars";

  if (selectedCondition === "new") {
    pageTitle = "🚗 New Cars";
  }

  if (selectedCondition === "used") {
    pageTitle = "🚙 Used Cars";
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="cars-page">
        <h1>Loading Cars...</h1>
      </div>
    );
  }

  return (
    <div className="cars-page">

      {/* TITLE */}

      <h1>{pageTitle}</h1>

      {/* SEARCH + SORT */}

      <div className="cars-controls">

        <input
          className="car-search"
          type="text"
          placeholder="🔎 Search car, city, description..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
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

      {/* RESULT COUNT */}

      <p
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "18px",
          color: "#555",
        }}
      >
        {sortedCars.length} car(s) found
      </p>

      {/* CARS */}

      <div className="cars-grid">

        {sortedCars.length === 0 ? (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              padding: "50px 20px",
            }}
          >
            <h2>No cars found.</h2>

            <p
              style={{
                marginTop: "10px",
                color: "#777",
              }}
            >
              Try another search or condition.
            </p>
          </div>
        ) : (
          sortedCars.map((car) => (
            <div
              className="car-card"
              key={car.id}
            >

              {/* IMAGE */}

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

              {/* INFORMATION */}

              <div className="car-info">

                <span className="category">
                  🚗 Cars
                </span>

                <h3>{car.title}</h3>

                <h2>
                  ETB {car.price}
                </h2>

                {car.condition && (
                  <p>
                    🔄 Condition:{" "}
                    {car.condition}
                  </p>
                )}

                <p>
                  📍 {car.city}
                </p>

                <p>
                  {car.description}
                </p>

                {/* DETAILS */}

                <Link
                  to={`/ad/${car.id}`}
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <button
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "10px",
                      border: "none",
                      borderRadius: "8px",
                      background: "#2e7d32",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    👁 View Details
                  </button>
                </Link>

                {/* CALL */}

                {car.phone && (
                  <a
                    href={`tel:${car.phone}`}
                    className="phone-link"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: "10px",
                      padding: "12px",
                      background: "#1976d2",
                      color: "white",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontWeight: "600",
                    }}
                  >
                    📞 Call Seller
                  </a>
                )}

              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default Cars;