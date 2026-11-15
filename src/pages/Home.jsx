// FILE: src/pages/Home.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import AnimatedCar from "./AnimatedCar";
import { getAutocompleteSuggestions } from "../utils/localSearchEngine";
import {
  IMAGE_SEARCH_SESSION_KEY,
  runExactImageSearch,
} from "../utils/imageSearchClient";

function Home() {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState(null);
  const [latestAds, setLatestAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(true);

  // Search Engine + AI Photo Search state
  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imageSearching, setImageSearching] = useState(false);
  const [imageSearchError, setImageSearchError] = useState("");
  const searchWrapperRef = useRef(null);
  const imageInputRef = useRef(null);

  const categories = [
    { id: "cars", icon: "🚗", title: "Cars", description: "New, used, electric cars and car rental", options: [
      { name: "🚗 New Cars", link: "/cars?condition=new" },
      { name: "🚙 Used Cars", link: "/cars?condition=used" },
      { name: "⚡ Electric Cars", link: "/cars?condition=electric" },
      { name: "🚘 Cars for Rent", link: "/cars?condition=rent" },
    ]},
    { id: "houses", icon: "🏠", title: "Houses", description: "Houses for sale and rent", options: [
      { name: "🏠 Houses for Sale", link: "/houses?type=sale" },
      { name: "🏠 Houses for Rent", link: "/houses?type=rent" },
    ]},
    { id: "rentals", icon: "🏢", title: "Rentals", description: "Apartments, shops and offices", options: [
      { name: "🏢 Apartments", link: "/rentals?type=apartment" },
      { name: "🏪 Shops", link: "/rentals?type=shop" },
      { name: "🏢 Offices", link: "/rentals?type=office" },
    ]},
    { id: "electronics", icon: "📱", title: "Electronics", description: "Phones, computers, TVs and more", options: [
      { name: "📱 New Phones", link: "/search?category=Electronics&subcategory=Phones&condition=new" },
      { name: "📱 Used Phones", link: "/search?category=Electronics&subcategory=Phones&condition=used" },
      { name: "💻 New Computers & Laptops", link: "/search?category=Electronics&subcategory=Computers&condition=new" },
      { name: "💻 Used Computers & Laptops", link: "/search?category=Electronics&subcategory=Computers&condition=used" },
      { name: "📺 New TVs", link: "/search?category=Electronics&subcategory=TVs&condition=new" },
      { name: "📺 Used TVs", link: "/search?category=Electronics&subcategory=TVs&condition=used" },
      { name: "🎧 Audio & Accessories", link: "/search?category=Electronics&subcategory=Audio" },
      { name: "🔌 Other Electronics", link: "/search?category=Electronics&subcategory=Other" },
    ]},
    { id: "furniture", icon: "🛋️", title: "Furniture", description: "New and used furniture", options: [
      { name: "🛋️ Sofas", link: "/search?category=Furniture&subcategory=Sofas" },
      { name: "🛏️ Beds", link: "/search?category=Furniture&subcategory=Beds" },
      { name: "🪑 Chairs & Tables", link: "/search?category=Furniture&subcategory=Chairs%20and%20Tables" },
      { name: "🗄️ Cabinets", link: "/search?category=Furniture&subcategory=Cabinets" },
      { name: "🪞 Other Furniture", link: "/search?category=Furniture&subcategory=Other" },
    ]},
    { id: "clothes", icon: "👗", title: "Clothes", description: "Men's and Women's fashion", options: [
      { name: "👕 Men's Clothing", link: "/search?category=Clothes&subcategory=Men" },
      { name: "👗 Women's Clothing", link: "/search?category=Clothes&subcategory=Women" },
      { name: "👟 Shoes", link: "/search?category=Clothes&subcategory=Shoes" },
      { name: "👜 Bags & Accessories", link: "/search?category=Clothes&subcategory=Accessories" },
    ]},
    { id: "labor", icon: "👷", title: "Labor & Services", description: "Find skilled workers and services", options: [
      { name: "👷 Construction Worker", link: "/search?category=Labor%20%26%20Services&subcategory=Construction" },
      { name: "⚡ Electrician", link: "/search?category=Labor%20%26%20Services&subcategory=Electrician" },
      { name: "🚰 Plumber", link: "/search?category=Labor%20%26%20Services&subcategory=Plumber" },
      { name: "🎨 Painter", link: "/search?category=Labor%20%26%20Services&subcategory=Painter" },
      { name: "🧹 Cleaning", link: "/search?category=Labor%20%26%20Services&subcategory=Cleaning" },
      { name: "🚚 Moving & Transport", link: "/search?category=Labor%20%26%20Services&subcategory=Moving" },
      { name: "🔧 Other Services", link: "/search?category=Labor%20%26%20Services&subcategory=Other" },
    ]},
    { id: "min-alish-tera", icon: "🏪", title: "ምንአለሽ ተራ", description: "Used and second-hand items", options: [
      { name: "📦 Used Items", link: "/search?category=ምንአለሽ%20ተራ&subcategory=Items" },
      { name: "♻️ Second-Hand Goods", link: "/search?category=ምንአለሽ%20ተራ&subcategory=Other" },
    ]},
  ];

  // ✅ REAL-TIME LISTENER
  useEffect(() => {
    const q = query(collection(db, "ads"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ads = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));

      ads.sort((a, b) => {
        const aFeat = a.featured ? 1 : 0;
        const bFeat = b.featured ? 1 : 0;
        if (aFeat !== bFeat) return bFeat - aFeat;
        return getAdTime(b) - getAdTime(a);
      });

      setLatestAds(ads);
      setAdsLoading(false);
    }, (error) => {
      console.error("Error listening to ads:", error);
      setAdsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Close autocomplete dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const getAdTime = (ad) => {
    if (!ad?.createdAt) return 0;
    if (typeof ad.createdAt.toMillis === "function") return ad.createdAt.toMillis();
    if (typeof ad.createdAt === "object" && ad.createdAt.seconds) return ad.createdAt.seconds * 1000;
    if (ad.createdAt instanceof Date) return ad.createdAt.getTime();
    const date = new Date(ad.createdAt).getTime();
    return Number.isNaN(date) ? 0 : date;
  };

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

  const toggleCategory = (id) => {
    setOpenCategory(openCategory === id ? null : id);
  };

  const handleSearch = (overrideQuery) => {
    const value = (typeof overrideQuery === "string" ? overrideQuery : searchText).trim();
    setDropdownOpen(false);
    if (value) navigate(`/search?search=${encodeURIComponent(value)}`);
    else navigate("/search");
  };

  const handleImageSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setDropdownOpen(false);
    setImageSearchError("");
    setImageSearching(true);

    try {
      const result = await runExactImageSearch({
        file,
        clientAds: latestAds,
      });

      try {
        sessionStorage.setItem(
          IMAGE_SEARCH_SESSION_KEY,
          JSON.stringify({
            previewDataUrl: result.previewDataUrl,
            analysis: result.analysis,
            exactQuery: result.exactQuery,
            matches: result.matches,
            createdAt: Date.now(),
          })
        );
      } catch {
        sessionStorage.setItem(
          IMAGE_SEARCH_SESSION_KEY,
          JSON.stringify({
            previewDataUrl: "",
            analysis: result.analysis,
            exactQuery: result.exactQuery,
            matches: result.matches,
            createdAt: Date.now(),
          })
        );
      }

      navigate(`/search?mode=image&search=${encodeURIComponent(result.exactQuery || "")}`);
    } catch (err) {
      setImageSearchError(err?.message || "Could not analyze image. Please try another photo.");
    } finally {
      setImageSearching(false);
    }
  };

  // Live bilingual autocomplete suggestions
  const liveSuggestions = useMemo(() => {
    if (!searchText.trim()) return { categories: [], brands: [], locations: [], ads: [] };
    return getAutocompleteSuggestions(latestAds, searchText, 6);
  }, [latestAds, searchText]);

  const hasSuggestions =
    liveSuggestions.categories.length > 0 ||
    liveSuggestions.brands.length > 0 ||
    liveSuggestions.locations.length > 0 ||
    liveSuggestions.ads.length > 0;

  return (
    <main className="home-page">
      {/* Minimal styles ONLY for the new camera button & autocomplete dropdown */}
      <style>{`
        .home-search { position: relative; }
        .home-search-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .home-search-camera-btn {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          border: 2px solid #dbeafe;
          background: #ffffff;
          color: #1976d2;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
        }
        .home-search-camera-btn:hover { background: #eff6ff; border-color: #1976d2; }
        .home-search-camera-btn:disabled { opacity: 0.65; cursor: wait; }
        .home-search-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid #dbe3ee;
          border-radius: 12px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
          z-index: 990;
          overflow: hidden;
          text-align: left;
          max-height: 420px;
          overflow-y: auto;
        }
        .home-search-status-toast {
          max-width: 750px;
          margin: 8px auto 0;
          padding: 10px 14px;
          border-radius: 10px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e3a8a;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .home-search-status-toast.error {
          background: #fef2f2;
          border-color: #fecaca;
          color: #991b1b;
        }
        @media (max-width: 600px) {
          .home-search-actions { width: 100%; }
          .home-search-actions .home-search-camera-btn { flex: 0 0 54px; }
          .home-search-actions .home-search-icon { flex: 1; height: 50px; border-radius: 8px; }
        }
      `}</style>

      {/* ✅ BLUE HERO SECTION */}
      <section className="home-hero" style={{ overflow: "hidden", padding: "20px 0" }}>
        <div className="hero-marquee">
          <div className="hero-marquee-content">
            <h1>የኛ ገበያ</h1>
            <h2>Buy • Sell • Rent Across Ethiopia</h2>
            <p>Find cars, houses, rentals, electronics, furniture, labor and more anywhere in Ethiopia.</p>
          </div>
        </div>
      </section>

      <AnimatedCar />

      <div className="home-search-wrapper" ref={searchWrapperRef}>
        <div className="home-search">
          <input
            type="text"
            value={searchText}
            onFocus={() => {
              if (searchText.trim()) setDropdownOpen(true);
            }}
            onChange={(e) => {
              const val = e.target.value;
              setSearchText(val);
              setDropdownOpen(Boolean(val.trim()));
            }}
            placeholder="🔎 Search cars, houses, furniture, labor and more..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
              if (e.key === "Escape") setDropdownOpen(false);
            }}
          />

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageSelected}
          />

          <div className="home-search-actions">
            <button
              type="button"
              className="home-search-camera-btn"
              onClick={() => {
                setImageSearchError("");
                imageInputRef.current?.click();
              }}
              disabled={imageSearching}
              title="AI Exact Image Search (upload a photo)"
              aria-label="Search by photo"
            >
              {imageSearching ? (
                <span style={{ fontSize: "18px" }}>⏳</span>
              ) : (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1976d2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="home-search-icon"
              onClick={() => handleSearch()}
              aria-label="Search"
            >
              🔎
            </button>
          </div>

          {dropdownOpen && searchText.trim() && (
            <div className="home-search-dropdown" role="listbox">
              {(liveSuggestions.categories.length > 0 ||
                liveSuggestions.brands.length > 0 ||
                liveSuggestions.locations.length > 0) && (
                <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", marginBottom: "6px" }}>
                    Matching Categories &amp; Ethiopia Locations
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {liveSuggestions.categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate(`/search?category=${encodeURIComponent(cat.id)}`);
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "5px 10px",
                          borderRadius: "8px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#1e293b",
                          cursor: "pointer",
                        }}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                        <span style={{ color: "#64748b" }}>({cat.amharic})</span>
                      </button>
                    ))}
                    {liveSuggestions.brands.map((brand) => (
                      <button
                        key={brand.query}
                        type="button"
                        onClick={() => handleSearch(brand.query)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "8px",
                          backgroundColor: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#1e40af",
                          cursor: "pointer",
                        }}
                      >
                        🔎 {brand.label}
                      </button>
                    ))}
                    {liveSuggestions.locations.map((loc) => (
                      <button
                        key={loc.query}
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate(`/search?city=${encodeURIComponent(loc.query)}`);
                        }}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "8px",
                          backgroundColor: "#ecfdf5",
                          border: "1px solid #a7f3d0",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#065f46",
                          cursor: "pointer",
                        }}
                      >
                        📍 {loc.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {liveSuggestions.ads.length > 0 ? (
                <div>
                  {liveSuggestions.ads.map((item) => {
                    const thumb =
                      Array.isArray(item.ad.images) && item.ad.images.length > 0
                        ? item.ad.images[0]
                        : item.ad.image;
                    return (
                      <Link
                        key={item.ad.id}
                        to={`/ad/${item.ad.id}`}
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderBottom: "1px solid #f1f5f9",
                          textDecoration: "none",
                          color: "#0f172a",
                        }}
                      >
                        <img
                          src={thumb || "/mycar.png"}
                          alt={item.resolvedTitle}
                          style={{
                            width: "46px",
                            height: "46px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            backgroundColor: "#f1f5f9",
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#0f172a",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.resolvedTitle}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                            <span style={{ color: "#1d4ed8", fontWeight: 600 }}>
                              {item.resolvedCategory}
                            </span>
                            {item.ad.city && <span> • {item.ad.city}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: "12px", fontWeight: 800, color: "#047857" }}>
                            ETB {Number(item.numericPrice || 0).toLocaleString()}
                          </div>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>View →</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : !hasSuggestions ? (
                <div style={{ padding: "14px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>
                  No direct matches for &ldquo;{searchText}&rdquo; — press Enter for full search.
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => handleSearch()}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#f8fafc",
                  border: "none",
                  borderTop: "1px solid #e2e8f0",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#1d4ed8",
                  cursor: "pointer",
                }}
              >
                See all marketplace results for &ldquo;{searchText.trim()}&rdquo; →
              </button>
            </div>
          )}
        </div>

        {imageSearching && (
          <div className="home-search-status-toast">
            <span>✨ AI Exact Image Search is analyzing your photo and matching listings...</span>
          </div>
        )}

        {imageSearchError && (
          <div className="home-search-status-toast error">
            <span style={{ flex: 1 }}>{imageSearchError}</span>
            <button
              type="button"
              onClick={() => setImageSearchError("")}
              style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <section className="home-categories">
        <h2 className="home-section-title">All Categories</h2>
        <div className="home-category-scroll">
          {categories
            .filter((c) => ["cars", "houses", "rentals", "electronics", "furniture", "clothes", "labor", "min-alish-tera"].includes(c.id))
            .map((category) => (
              <button
                key={category.id}
                type="button"
                className={`home-category-circle-item ${openCategory === category.id ? "active" : ""}`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="home-main-circle">{category.icon}</div>
                <div className="home-main-category-name">{category.title}</div>
              </button>
            ))}
        </div>

        {openCategory && (
          <div className="home-selected-options">
            {categories.filter((c) => c.id === openCategory).map((category) => (
              <div key={category.id} className="home-options-box">
                <h3>{category.title}</h3>
                <div className="home-options-list">
                  {category.options.map((option) => (
                    <Link key={option.name} to={option.link} className="home-option-button">{option.name}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ✅ NEW ADVERTISING BANNER SPACE */}
      <section className="promoted-ad-section">
        <Link to="/post-ad" className="promoted-ad-banner">
          <div className="promoted-ad-content">
            <h3>📢 Want to sell something fast?</h3>
            <p>Post your ad on የኛ ገበያ today and reach thousands of buyers across Ethiopia!</p>
            <span className="promoted-ad-btn">Post Free Ad Now →</span>
          </div>
          <div className="promoted-ad-icon">🚀</div>
        </Link>
      </section>

      <section className="latest-ads-section">
        <div className="latest-ads-header">
          <h2>🆕 Latest Advertisements</h2>
          <Link to="/search" className="view-all-ads">View All →</Link>
        </div>

        {adsLoading ? (
          <div className="latest-ads-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
        ) : latestAds.length === 0 ? (
          <div className="latest-ads-empty">
            <h3>No advertisements yet.</h3>
            <p>Be the first person to post an advertisement.</p>
            <Link to="/post-ad">📢 Post Advertisement</Link>
          </div>
        ) : (
          <div className="latest-ads-grid">
            {latestAds.map((ad) => {
              const adImage = Array.isArray(ad.images) && ad.images.length > 0 ? ad.images[0] : ad.image;
              const shortDescription = ad.description
                ? ad.description.length > 100
                  ? `${ad.description.substring(0, 100)}...`
                  : ad.description
                : "No description available.";
              const postedTime = getPostedTime(ad.createdAt);
              const isSold = ad.status === "sold";
              const isFeatured = ad.featured === true;

              return (
                <div className="latest-ad-card" key={ad.id}>
                  <Link to={`/ad/${ad.id}`} className="latest-ad-image-link">
                    <div className="latest-ad-image">
                      {isFeatured && <div className="card-featured-badge">⭐ FEATURED</div>}
                      {isSold && <div className="card-sold-badge">SOLD</div>}
                      {adImage ? (
                        <img
                          src={adImage}
                          alt={ad.title || "Advertisement"}
                          loading="lazy"
                          className={`latest-ad-photo ${isSold ? "sold-card-image" : ""}`}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <div className="latest-no-image">📷 No Image</div>
                      )}
                    </div>
                  </Link>

                  <div className="latest-ad-info">
                    <span className="latest-ad-category">{ad.category || "Advertisement"}</span>
                    <h3>{ad.title || "Untitled Advertisement"}</h3>
                    <h4>ETB {ad.price}</h4>

                    {postedTime && <p className="latest-ad-posted-time">🕒 Posted {postedTime}</p>}
                    {ad.city && <p>📍 {ad.city}</p>}
                    {ad.condition && <p>🔄 {ad.condition}</p>}
                    {ad.subcategory && <p>📂 {ad.subcategory}</p>}

                    <p className="latest-ad-views">👁 {ad.views || 0} views</p>

                    <p className="latest-ad-description">{shortDescription}</p>

                    {Array.isArray(ad.images) && ad.images.length > 1 && (
                      <p className="image-count">🖼️ {ad.images.length} images</p>
                    )}
                    <Link to={`/ad/${ad.id}`} className="latest-view-button">👁 View Details</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;
