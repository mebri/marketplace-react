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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // =========================
  // GET AD TIME (FOR SORTING)
  // =========================
  const getAdTime = (ad) => {
    if (!ad?.createdAt) return 0;
    if (typeof ad.createdAt.toMillis === "function") return ad.createdAt.toMillis();
    if (typeof ad.createdAt === "object" && ad.createdAt.seconds)
      return ad.createdAt.seconds * 1000;
    if (ad.createdAt instanceof Date) return ad.createdAt.getTime();
    const date = new Date(ad.createdAt).getTime();
    return Number.isNaN(date) ? 0 : date;
  };

  // =========================
  // DISPLAY POST TIME
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

    return postedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
      setLoading(true);

      // Load ads
      const snapshot = await getDocs(collection(db, "ads"));
      const allAds = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      // Load users (to get seller pictures)
      const usersSnap = await getDocs(collection(db, "users"));
      const allUsers = usersSnap.docs.map((u) => ({
        uid: u.id,
        ...u.data(),
      }));
      setUsers(allUsers);

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

      setAds(filteredAds);
    } catch (error) {
      console.error("Error loading advertisements:", error);
    }
    setLoading(false);
  };

  // =========================
  // FIND SELLER FOR AN AD
  // =========================
  const findSeller = (ad) => {
    if (!ad) return null;

    // Match by userId first, then fallbacks
    return users.find(
      (u) =>
        u.uid === ad.userId ||
        u.uid === ad.uid ||
        u.uid === ad.ownerId ||
        (u.email && u.email === ad.userEmail)
    );
  };

  // =========================
  // APPLY SORT + PRICE FILTER
  // =========================
  const displayedAds = [...ads]
    .filter((ad) => {
      const price = Number(String(ad.price || 0).replace(/,/g, ""));
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return getAdTime(b) - getAdTime(a);
      if (sortBy === "price-low") {
        const pa = Number(String(a.price || 0).replace(/,/g, ""));
        const pb = Number(String(b.price || 0).replace(/,/g, ""));
        return pa - pb;
      }
      if (sortBy === "price-high") {
        const pa = Number(String(a.price || 0).replace(/,/g, ""));
        const pb = Number(String(b.price || 0).replace(/,/g, ""));
        return pb - pa;
      }
      return 0;
    });

  // =========================
  // TITLE
  // =========================
  let resultTitle = "All Advertisements";
  if (searchText) resultTitle = `Search: "${searchText}"`;
  if (selectedCategory) resultTitle += ` • ${selectedCategory}`;
  if (selectedSubcategory) resultTitle += ` • ${selectedSubcategory}`;
  if (selectedCondition) resultTitle += ` • ${selectedCondition}`;
  if (selectedType) resultTitle += ` • ${selectedType}`;

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="cars-page">
        <h1>🔎 Search Results</h1>
        <div className="cars-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton-img" />
              <div className="skeleton-info">
                <div className="skeleton-line short" />
                <div className="skeleton-line long" />
                <div className="skeleton-line medium" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cars-page">
      <h1>🔎 Search Results</h1>
      <p className="search-result-title">{resultTitle}</p>

      {/* FILTER BAR */}
      <div className="search-filter-bar">
        <div className="search-filter-group">
          <label>Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">🆕 Newest first</option>
            <option value="price-low">💰 Price: Low → High</option>
            <option value="price-high">💎 Price: High → Low</option>
          </select>
        </div>

        <div className="search-filter-group">
          <label>Min price (ETB)</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="search-filter-group">
          <label>Max price (ETB)</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Any"
          />
        </div>

        {(minPrice || maxPrice || sortBy !== "newest") && (
          <button
            className="search-clear-filters"
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
              setSortBy("newest");
            }}
          >
            ✕ Clear filters
          </button>
        )}
      </div>

      <p className="search-result-count">
        {displayedAds.length} advertisement{displayedAds.length !== 1 ? "s" : ""} found
      </p>

      {displayedAds.length === 0 ? (
        <div className="search-no-results">
          <div className="search-no-results-icon">📭</div>
          <h2>No advertisements found</h2>
          <p>Try another search term, or remove some filters.</p>
          <Link to="/" className="dashboard-primary-btn">← Back Home</Link>
        </div>
      ) : (
        <div className="cars-grid">
          {displayedAds.map((ad) => {
            const adImage =
              Array.isArray(ad.images) && ad.images.length > 0
                ? ad.images[0]
                : ad.image;
            const postedTime = getPostedTime(ad.createdAt);
            const seller = findSeller(ad);
            const sellerName =
              seller?.name || ad.userName || "Seller";
            const sellerInitial = sellerName.charAt(0).toUpperCase();

            return (
              <div className="car-card" key={ad.id}>
                <Link to={`/ad/${ad.id}`} className="car-image-link">
                  {adImage ? (
                    <img
                      src={adImage}
                      alt={ad.title || "Advertisement"}
                      className="listing-photo"
                      loading="lazy"
                    />
                  ) : (
                    <div className="listing-image">📷 No Image</div>
                  )}
                </Link>

                <div className="car-info">
                  <span className="category">{ad.category || "Advertisement"}</span>
                  <h3>{ad.title || "Untitled Advertisement"}</h3>

                  <h2 className="car-price">
                    ETB{" "}
                    {Number(
                      String(ad.price || 0).replace(/,/g, "")
                    ).toLocaleString("en-US")}
                  </h2>

                  {/* SELLER ROW */}
                  <Link
                    to={seller ? `/user/${seller.uid}` : "#"}
                    className="search-seller-row"
                    onClick={(e) => {
                      if (!seller) e.preventDefault();
                    }}
                  >
                    <div className="search-seller-avatar">
                      {seller?.imageUrl ? (
                        <img
                          src={seller.imageUrl}
                          alt={sellerName}
                          loading="lazy"
                        />
                      ) : (
                        <span>{sellerInitial}</span>
                      )}
                    </div>
                    <div className="search-seller-text">
                      <strong>{sellerName}</strong>
                      {ad.city && <span>📍 {ad.city}</span>}
                    </div>
                  </Link>

                  {postedTime && (
                    <p className="latest-ad-posted-time">🕒 Posted {postedTime}</p>
                  )}

                  {ad.condition && <p>🔄 {ad.condition}</p>}
                  {ad.subcategory && <p>📂 {ad.subcategory}</p>}
                  {ad.type && <p>🏷️ {ad.type}</p>}

                  <p className="car-description">{ad.description}</p>

                  <Link to={`/ad/${ad.id}`} className="car-details-link">
                    👁 View Details
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
