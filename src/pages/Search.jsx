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

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, [searchText, selectedCategory]);

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

        const matchesCategory =
          !selectedCategory ||
          ad.category === selectedCategory;

        return (
          matchesSearch &&
          matchesCategory
        );
      });

      setAds(filteredAds);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="cars-page">
        <h1>Searching...</h1>
      </div>
    );
  }

  return (
    <div className="cars-page">

      <h1>🔎 Search Results</h1>

      <p
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "18px",
        }}
      >
        {searchText
          ? `Search: "${searchText}"`
          : "All Advertisements"}

        {selectedCategory &&
          ` • ${selectedCategory}`}
      </p>

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
        <div className="cars-grid">

          {ads.map((ad) => (
            <div
              className="car-card"
              key={ad.id}
            >

              {/* Image */}

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

              {/* Information */}

              <div className="car-info">

                <span className="category">
                  {ad.category}
                </span>

                <h3>
                  {ad.title}
                </h3>

                <h2>
                  ETB {ad.price}
                </h2>

                <p>
                  📍 {ad.city}
                </p>

                {ad.condition && (
                  <p>
                    🔄 Condition:{" "}
                    {ad.condition}
                  </p>
                )}

                {ad.materialType && (
                  <p>
                    🧱 Material:{" "}
                    {ad.materialType}
                  </p>
                )}

                <p>
                  {ad.description}
                </p>

                <Link
                  to={`/ad/${ad.id}`}
                >
                  <button
                    style={{
                      background: "#2e7d32",
                      color: "white",
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