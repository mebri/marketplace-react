import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

function Search() {
  const [searchParams] = useSearchParams();

  const searchText =
    searchParams.get("search") || "";

  const selectedCategory =
    searchParams.get("category") || "";

  const selectedCondition =
    searchParams.get("condition") || "";

  const selectedSubcategory =
    searchParams.get("subcategory") || "";

  const selectedType =
    searchParams.get("type") || "";

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, [
    searchText,
    selectedCategory,
    selectedCondition,
    selectedSubcategory,
    selectedType,
  ]);

  const loadAds = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "ads")
      );

      const allAds = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      const searchLower =
        searchText.toLowerCase().trim();

      const filteredAds = allAds.filter((ad) => {

        // =========================
        // SEARCH
        // =========================

        const matchesSearch =
          !searchLower ||
          ad.title
            ?.toLowerCase()
            .includes(searchLower) ||
          ad.description
            ?.toLowerCase()
            .includes(searchLower) ||
          ad.city
            ?.toLowerCase()
            .includes(searchLower) ||
          ad.category
            ?.toLowerCase()
            .includes(searchLower);

        // =========================
        // CATEGORY
        // =========================

        const matchesCategory =
          !selectedCategory ||
          ad.category === selectedCategory;

        // =========================
        // CONDITION
        // =========================

        const matchesCondition =
          !selectedCondition ||
          ad.condition?.toLowerCase() ===
            selectedCondition.toLowerCase();

        // =========================
        // SUBCATEGORY
        // =========================

        const matchesSubcategory =
          !selectedSubcategory ||
          ad.subcategory?.toLowerCase() ===
            selectedSubcategory.toLowerCase();

        // =========================
        // TYPE
        // =========================

        const matchesType =
          !selectedType ||
          ad.type?.toLowerCase() ===
            selectedType.toLowerCase();

        return (
          matchesSearch &&
          matchesCategory &&
          matchesCondition &&
          matchesSubcategory &&
          matchesType
        );
      });

      setAds(filteredAds);

    } catch (error) {
      console.error(
        "Error loading advertisements:",
        error
      );
    }

    setLoading(false);
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="cars-page">
        <h1>Searching...</h1>
      </div>
    );
  }

  // =========================
  // TITLE
  // =========================

  let resultTitle = "All Advertisements";

  if (searchText) {
    resultTitle = `Search: "${searchText}"`;
  }

  if (selectedCategory) {
    resultTitle += ` • ${selectedCategory}`;
  }

  if (selectedSubcategory) {
    resultTitle += ` • ${selectedSubcategory}`;
  }

  if (selectedCondition) {
    resultTitle += ` • ${selectedCondition}`;
  }

  if (selectedType) {
    resultTitle += ` • ${selectedType}`;
  }

  return (
    <div className="cars-page">

      {/* =========================
          HEADER
      ========================= */}

      <h1>🔎 Search Results</h1>

      <p
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "18px",
        }}
      >
        {resultTitle}
      </p>

      {/* =========================
          NO RESULTS
      ========================= */}

      {ads.length === 0 ? (

        <div
          style={{
            textAlign: "center",
            padding: "50px",
          }}
        >

          <h2>
            No advertisements found.
          </h2>

          <p>
            Try another search or category.
          </p>

        </div>

      ) : (

        /* =========================
           RESULTS
        ========================= */

        <div className="cars-grid">

          {ads.map((ad) => (

            <div
              className="car-card"
              key={ad.id}
            >

              {/* =========================
                  IMAGE
              ========================= */}

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

              {/* =========================
                  INFORMATION
              ========================= */}

              <div className="car-info">

                {/* Category */}

                <span className="category">
                  {ad.category}
                </span>

                {/* Title */}

                <h3>
                  {ad.title}
                </h3>

                {/* Price */}

                <h2>
                  ETB {ad.price}
                </h2>

                {/* City */}

                <p>
                  📍 {ad.city}
                </p>

                {/* Condition */}

                {ad.condition && (
                  <p>
                    🔄 Condition:{" "}
                    {ad.condition}
                  </p>
                )}

                {/* Material */}

                {ad.materialType && (
                  <p>
                    🧱 Material:{" "}
                    {ad.materialType}
                  </p>
                )}

                {/* Subcategory */}

                {ad.subcategory && (
                  <p>
                    📂 Category:{" "}
                    {ad.subcategory}
                  </p>
                )}

                {/* Type */}

                {ad.type && (
                  <p>
                    🏷️ Type:{" "}
                    {ad.type}
                  </p>
                )}

                {/* Description */}

                <p>
                  {ad.description}
                </p>

                {/* Details */}

                <Link
                  to={`/ad/${ad.id}`}
                >
                  <button
                    style={{
                      background: "#2e7d32",
                      color: "white",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "6px",
                      cursor: "pointer",
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

export default Search;