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

function Houses() {
  const [searchParams] = useSearchParams();

  const selectedType =
    searchParams.get("type") || "";

  const [houses, setHouses] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHouses();
  }, []);

  const loadHouses = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "ads")
      );

      const houseAds = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .filter(
          (ad) => ad.category === "Houses"
        );

      setHouses(houseAds);
    } catch (error) {
      console.error(
        "Error loading houses:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // TYPE FILTER
  // =========================

  const typeFilteredHouses =
    houses.filter((house) => {
      if (!selectedType) {
        return true;
      }

      return (
        house.type?.toLowerCase() ===
        selectedType.toLowerCase()
      );
    });

  // =========================
  // SEARCH
  // =========================

  const filteredHouses =
    typeFilteredHouses.filter((house) => {
      const text =
        search.toLowerCase().trim();

      if (!text) {
        return true;
      }

      return (
        house.title
          ?.toLowerCase()
          .includes(text) ||
        house.city
          ?.toLowerCase()
          .includes(text) ||
        house.description
          ?.toLowerCase()
          .includes(text)
      );
    });

  // =========================
  // SORT
  // =========================

  const sortedHouses = [
    ...filteredHouses,
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

  let pageTitle = "🏠 Houses";

  if (selectedType === "sale") {
    pageTitle = "🏠 Houses for Sale";
  }

  if (selectedType === "rent") {
    pageTitle = "🏠 Houses for Rent";
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="cars-page">
        <h1>🏠 Loading Houses...</h1>
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
          placeholder="🔎 Search house, city, description..."
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
        {sortedHouses.length} house(s) found
      </p>

      {/* HOUSES */}

      <div className="cars-grid">

        {sortedHouses.length === 0 ? (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              padding: "50px 20px",
            }}
          >
            <h2>No houses found.</h2>

            <p
              style={{
                marginTop: "10px",
                color: "#777",
              }}
            >
              Try another search or type.
            </p>
          </div>
        ) : (
          sortedHouses.map((house) => (
            <div
              className="car-card"
              key={house.id}
            >

              {/* IMAGE */}

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

              {/* INFORMATION */}

              <div className="car-info">

                <span className="category">
                  🏠 Houses
                </span>

                <h3>{house.title}</h3>

                <h2>
                  ETB {house.price}
                </h2>

                {house.type && (
                  <p>
                    🏷️{" "}
                    {house.type === "sale"
                      ? "For Sale"
                      : house.type === "rent"
                      ? "For Rent"
                      : house.type}
                  </p>
                )}

                <p>
                  📍 {house.city}
                </p>

                <p>
                  {house.description}
                </p>

                {/* VIEW DETAILS */}

                <Link
                  to={`/ad/${house.id}`}
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

                {/* CALL SELLER */}

                {house.phone && (
                  <a
                    href={`tel:${house.phone}`}
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

export default Houses;