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

function Rentals() {
  const [searchParams] = useSearchParams();

  const selectedType =
    searchParams.get("type") || "";

  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "ads")
      );

      const rentalAds = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .filter(
          (ad) => ad.category === "Rentals"
        );

      setRentals(rentalAds);
    } catch (error) {
      console.error(
        "Error loading rentals:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // TYPE FILTER
  // =========================

  const typeFilteredRentals =
    rentals.filter((rental) => {
      if (!selectedType) {
        return true;
      }

      return (
        rental.type?.toLowerCase() ===
        selectedType.toLowerCase()
      );
    });

  // =========================
  // SEARCH
  // =========================

  const filteredRentals =
    typeFilteredRentals.filter((rental) => {
      const text =
        search.toLowerCase().trim();

      if (!text) {
        return true;
      }

      return (
        rental.title
          ?.toLowerCase()
          .includes(text) ||
        rental.city
          ?.toLowerCase()
          .includes(text) ||
        rental.description
          ?.toLowerCase()
          .includes(text)
      );
    });

  // =========================
  // SORT
  // =========================

  const sortedRentals = [
    ...filteredRentals,
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
  // TITLE
  // =========================

  let pageTitle = "🏢 Rentals";

  if (selectedType === "apartment") {
    pageTitle = "🏢 Apartments";
  }

  if (selectedType === "house") {
    pageTitle = "🏠 Rental Houses";
  }

  if (selectedType === "shop") {
    pageTitle = "🏪 Shops for Rent";
  }

  if (selectedType === "office") {
    pageTitle = "🏢 Offices for Rent";
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="cars-page">
        <h1>Loading Rentals...</h1>
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
          placeholder="🔎 Search rental, city, description..."
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
        {sortedRentals.length} rental(s) found
      </p>

      {/* RENTALS */}

      <div className="cars-grid">

        {sortedRentals.length === 0 ? (

          <div
            style={{
              width: "100%",
              textAlign: "center",
              padding: "50px 20px",
            }}
          >
            <h2>
              No rentals found.
            </h2>

            <p
              style={{
                marginTop: "10px",
                color: "#777",
              }}
            >
              Try another search or rental type.
            </p>
          </div>

        ) : (

          sortedRentals.map((rental) => (

            <div
              className="car-card"
              key={rental.id}
            >

              {/* IMAGE */}

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

              {/* INFORMATION */}

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

                {rental.type && (
                  <p>
                    🏷️ Type:{" "}
                    {rental.type ===
                    "apartment"
                      ? "Apartment"
                      : rental.type ===
                        "house"
                      ? "House"
                      : rental.type ===
                        "shop"
                      ? "Shop"
                      : rental.type ===
                        "office"
                      ? "Office"
                      : rental.type}
                  </p>
                )}

                <p>
                  📍 {rental.city}
                </p>

                <p>
                  {rental.description}
                </p>

                {/* VIEW DETAILS */}

                <Link
                  to={`/ad/${rental.id}`}
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

                {rental.phone && (
                  <a
                    href={`tel:${rental.phone}`}
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

                {/* WHATSAPP */}

                {rental.phone && (
                  <a
                    href={`https://wa.me/${rental.phone.replace(
                      /\D/g,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: "10px",
                      padding: "12px",
                      background: "#25d366",
                      color: "white",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontWeight: "600",
                    }}
                  >
                    📱 WhatsApp Seller
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

export default Rentals;