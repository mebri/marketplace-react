import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

function Search() {
  const [searchParams] = useSearchParams();

  const searchText = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "";
  const selectedCondition = searchParams.get("condition") || "";
  const selectedSubcategory = searchParams.get("subcategory") || "";
  const selectedType = searchParams.get("type") || "";

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // GET AD TIME (FOR SORTING)
  // =========================
  const getAdTime = (ad) => {
    if (!ad?.createdAt) return 0;
    if (typeof ad.createdAt.toMillis === "function") return ad.createdAt.toMillis();
    if (typeof ad.createdAt === "object" && ad.createdAt.seconds) return ad.createdAt.seconds * 1000;
    if (ad.createdAt instanceof Date) return ad.createdAt.getTime();
    const date = new Date(ad.createdAt).getTime();
    return Number.isNaN(date) ? 0 : date;
  };

  // =========================
  // DISPLAY POST TIME (NEW)
  // =========================
  const getPostedTime = (createdAt) => {
    if (!createdAt) return "";
    let postedDate;
    if (typeof createdAt.toDate === "function") postedDate = createdAt.toDate();
    else if (createdAt.seconds) postedDate = new Date(createdAt.seconds * 1000);
    else if (createdAt instanceof Date) postedDate = createdAt;
    else postedDate = new Date(createdAt);

    if (Number.isNaN(postedDate.getTime())) return "";

    const now = new Date();
    const difference = now.getTime() - postedDate.getTime();
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (difference < 0) return "Just now";
    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

    return postedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

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
      const snapshot = await getDocs(collection(db, "ads"));

      const allAds = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      const searchLower = searchText.toLowerCase().trim();

      const filteredAds = allAds.filter((ad) => {
        const matchesSearch =
          !searchLower ||
          ad.title?.toLowerCase().includes(searchLower) ||
          ad.description?.toLowerCase().includes(searchLower) ||
          ad.city?.toLowerCase().includes(searchLower) ||
          ad.category?.toLowerCase().includes(searchLower);

        const matchesCategory =
          !selectedCategory || ad.category === selectedCategory;

        const matchesCondition =
          !selectedCondition ||
          ad.condition?.toLowerCase() === selectedCondition.toLowerCase();

        const matchesSubcategory =
          !selectedSubcategory ||
          ad.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase();

        const matchesType =
          !selectedType ||
          ad.type?.toLowerCase() === selectedType.toLowerCase();

        return (
          matchesSearch &&
          matchesCategory &&
          matchesCondition &&
          matchesSubcategory &&
          matchesType
        );
      });

      // SORT BY POST TIME (NEWEST FIRST)
      filteredAds.sort((a, b) => {
        return getAdTime(b) - getAdTime(a);
      });

      setAds(filteredAds);
    } catch (error) {
      console.error("Error loading advertisements:", error);
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

  let resultTitle = "All Advertisements";
  if (searchText) resultTitle = `Search: "${searchText}"`;
  if (selectedCategory) resultTitle += ` • ${selectedCategory}`;
  if (selectedSubcategory) resultTitle += ` • ${selectedSubcategory}`;
  if (selectedCondition) resultTitle += ` • ${selectedCondition}`;
  if (selectedType) resultTitle += ` • ${selectedType}`;

  return (
    <div className="cars-page">
      {/* HEADER */}
      <h1>🔎 Search Results</h1>
      <p style={{ textAlign: "center", marginBottom: "30px", fontSize: "18px" }}>
        {resultTitle}
      </p>

      {/* NO RESULTS */}
      {ads.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>No advertisements found.</h2>
          <p>Try another search or category.</p>
        </div>
      ) : (
        /* RESULTS */
        <div className="cars-grid">
          {ads.map((ad) => {
            const postedTime = getPostedTime(ad.createdAt);

            return (
              <div className="car-card" key={ad.id}>
                {/* IMAGE */}
                <Link to={`/ad/${ad.id}`} className="car-image-link">
                  {ad.image ? (
                    <img src={ad.image} alt={ad.title} className="listing-photo" />
                  ) : (
                    <div className="listing-image">📷 No Image</div>
                  )}
                </Link>

                {/* INFORMATION */}
                <div className="car-info">
                  <span className="category">{ad.category}</span>
                  <h3>{ad.title}</h3>
                  <h2>ETB {Number(ad.price || 0).toLocaleString()}</h2>
                  
                  <p>📍 {ad.city}</p>

                  {/* POSTED TIME - NEWLY ADDED */}
                  {postedTime && (
                    <p className="latest-ad-posted-time">🕒 Posted {postedTime}</p>
                  )}

                  {ad.condition && <p>🔄 Condition: {ad.condition}</p>}
                  {ad.materialType && <p>🧱 Material: {ad.materialType}</p>}
                  {ad.subcategory && <p>📂 Category: {ad.subcategory}</p>}
                  {ad.type && <p>🏷️ Type: {ad.type}</p>}

                  {/* DESCRIPTION (Clamped with CSS) */}
                  <p className="car-description">{ad.description}</p>

                  {/* DETAILS BUTTON */}
                  <Link to={`/ad/${ad.id}`} className="car-details-link">
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Search;
