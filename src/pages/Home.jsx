// FILE: src/pages/Home.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Link, useNavigate } from "react-router-dom";
import {
  searchMarketplaceAds,
  getAutocompleteSuggestions,
} from "../utils/localSearchEngine";
import {
  runExactImageSearch,
  IMAGE_SEARCH_SESSION_KEY,
} from "../utils/imageSearchClient";

export default function Home() {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [externalAds, setExternalAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [adsLoading, setAdsLoading] = useState(true);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [imageSearching, setImageSearching] = useState(false);
  const [imageError, setImageError] = useState("");
  const searchBoxRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Firebase Sync
  useEffect(() => {
    try {
      const q = query(collection(db, "ads"));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const fbAds = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          fbAds.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setAds(fbAds);
          setAdsLoading(false);
        },
        () => setAdsLoading(false)
      );
      return () => unsub();
    } catch {
      setAdsLoading(false);
    }
  }, []);

  // Close autocomplete dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // 2. Search API Call (External Worker + Local Search)
  const handleSearchSubmit = async (overrideQuery) => {
    const qText = typeof overrideQuery === "string" ? overrideQuery : searchQuery;
    setShowSuggestions(false);

    if (!qText.trim()) {
      setExternalAds([]);
      return;
    }

    try {
      const res = await fetch(
        `https://abaybot-worker.yegna.workers.dev/api/search?q=${encodeURIComponent(qText)}`
      );
      const data = await res.json();
      setExternalAds(data.external || []);
    } catch (error) {
      console.error(error);
    }
  };

  // 3. AI Exact Photo Search from Home Search Bar
  const handleHomePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    setImageSearching(true);
    setShowSuggestions(false);

    try {
      const result = await runExactImageSearch({ file, clientAds: ads });
      sessionStorage.setItem(IMAGE_SEARCH_SESSION_KEY, JSON.stringify(result));
      navigate("/search?mode=image");
    } catch (err) {
      setImageError(err?.message || "ፎቶውን መፈለግ አልተቻለም። እባክዎ እንደገና ይሞክሩ።");
    } finally {
      setImageSearching(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 4. Autocomplete Suggestions (English + Amharic + Locations + Ads)
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return { categories: [], brands: [], locations: [], ads: [] };
    return getAutocompleteSuggestions(ads, searchQuery, 5);
  }, [ads, searchQuery]);

  // 5. Smart Bilingual Filter & Ranking
  const filteredAds = useMemo(() => {
    return searchMarketplaceAds(ads, {
      query: searchQuery,
      category: selectedCategory === "all" ? "" : selectedCategory,
      sort: searchQuery.trim() ? "relevance" : "newest",
    }).map((r) => r.ad);
  }, [ads, selectedCategory, searchQuery]);

  const categories = [
    { id: "Cars", name: "Cars", icon: "🚗" },
    { id: "Houses", name: "Houses", icon: "🏠" },
    { id: "Rentals", name: "Rentals", icon: "🏢" },
    { id: "Electronics", name: "Electronics", icon: "📱" },
    { id: "Furniture", name: "Furniture", icon: "🛋️" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <style>{`
        @keyframes driveCar {
          0% { transform: translateX(-250px); }
          100% { transform: translateX(100vw); }
        }
        .car-animation {
          animation: driveCar 8s linear infinite;
          position: absolute;
          bottom: 0;
        }
        .ad-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        @media (max-width: 1024px) { .ad-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 768px) { .ad-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 480px) { .ad-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* HERO SECTION */}
      <section
        style={{
          background: "linear-gradient(135deg, #0052cc 0%, #0b4fb8 50%, #0a3e9c 100%)",
          color: "white",
          padding: "60px 20px 70px",
          textAlign: "center",
          position: "relative",
          overflow: "visible",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "900",
            margin: "0 0 15px",
            letterSpacing: "-1px",
            textShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          የኛ ገበያ
        </h1>
        <p style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 15px" }}>
          Buy • Sell • Rent Across Ethiopia
        </p>
        <p
          style={{
            fontSize: "16px",
            color: "#dbeafe",
            maxWidth: "650px",
            margin: "0 auto 30px",
            lineHeight: "1.6",
          }}
        >
          Find cars, houses, rentals, electronics, furniture, labor and more anywhere in Ethiopia.
        </p>

        {/* Animated Car */}
        <div style={{ height: "100px", position: "relative", marginBottom: "20px", overflow: "hidden" }}>
          <div className="car-animation">
            <svg
              viewBox="0 0 280 100"
              style={{ width: "220px", height: "auto", filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.4))" }}
            >
              <ellipse cx="140" cy="92" rx="120" ry="6" fill="rgba(0,0,0,0.3)" />
              <path
                d="M20 70 L30 50 C38 42 55 35 75 35 L165 35 C185 35 210 42 225 50 L255 58 C265 62 270 70 268 76 L262 82 C260 84 256 84 250 84 L216 84 C214 74 205 66 194 66 C183 66 174 74 172 84 L108 84 C106 74 97 66 86 66 C75 66 66 74 64 84 L25 84 C22 84 20 80 20 76 Z"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <path d="M75 38 L115 38 L115 54 L62 54 C66 48 70 42 75 38 Z" fill="#0f172a" />
              <path d="M120 38 L160 38 C175 38 190 42 198 52 L198 54 L120 54 Z" fill="#0f172a" />
              <path d="M245 60 L260 63 L255 68 L240 66 Z" fill="#38bdf8" />
              <path d="M21 62 L32 60 L30 68 L22 70 Z" fill="#ef4444" />
              <circle cx="86" cy="84" r="16" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <circle cx="86" cy="84" r="9" fill="#94a3b8" />
              <circle cx="194" cy="84" r="16" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <circle cx="194" cy="84" r="9" fill="#94a3b8" />
            </svg>
          </div>
        </div>

        {/* Search Bar + Autocomplete + Camera AI Search */}
        <div ref={searchBoxRef} style={{ maxWidth: "750px", margin: "0 auto", position: "relative", zIndex: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "6px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <span style={{ fontSize: "20px", margin: "0 12px", color: "#94a3b8" }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="መኪና፣ ቤት፣ BYD፣ Bole፣ Toyota ወይም ማንኛውንም ይፈልጉ..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchSubmit();
              }}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "16px",
                color: "#1e293b",
                backgroundColor: "transparent",
                minWidth: 0,
              }}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleHomePhotoSelect}
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageSearching}
              title="በፎቶ ይፈልጉ (AI Exact Image Search)"
              style={{
                backgroundColor: "#eff6ff",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe",
                borderRadius: "12px",
                padding: "10px 14px",
                marginRight: "8px",
                cursor: imageSearching ? "wait" : "pointer",
                fontSize: "15px",
                fontWeight: "700",
                whiteSpace: "nowrap",
              }}
            >
              {imageSearching ? "⏳ AI..." : "📷 Photo"}
            </button>

            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              style={{
                backgroundColor: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 22px",
                cursor: "pointer",
                fontSize: "17px",
                fontWeight: "bold",
              }}
            >
              Search
            </button>
          </div>

          {imageError && (
            <div
              style={{
                marginTop: "10px",
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {imageError}
            </div>
          )}

          {/* Instant Bilingual Autocomplete Dropdown */}
          {showSuggestions &&
            searchQuery.trim().length > 0 &&
            (suggestions.categories.length > 0 ||
              suggestions.brands.length > 0 ||
              suggestions.locations.length > 0 ||
              suggestions.ads.length > 0) && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: "8px",
                  backgroundColor: "white",
                  color: "#0f172a",
                  borderRadius: "16px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.22)",
                  textAlign: "left",
                  padding: "12px",
                  maxHeight: "420px",
                  overflowY: "auto",
                  border: "1px solid #e2e8f0",
                }}
              >
                {suggestions.categories.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", marginBottom: "6px" }}>
                      CATEGORIES / ምድቦች
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {suggestions.categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setShowSuggestions(false);
                          }}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "10px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#f8fafc",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        >
                          {cat.icon} {cat.name} ({cat.amharic}) • {cat.count}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.locations.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", marginBottom: "6px" }}>
                      ETHIOPIA LOCATIONS / ከተሞች
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {suggestions.locations.map((loc) => (
                        <button
                          key={loc.query}
                          type="button"
                          onClick={() => {
                            setSearchQuery(loc.query);
                            handleSearchSubmit(loc.query);
                          }}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "10px",
                            border: "1px solid #bfdbfe",
                            backgroundColor: "#eff6ff",
                            color: "#1e40af",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        >
                          📍 {loc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.ads.length > 0 && (
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", marginBottom: "6px" }}>
                      MATCHING LISTINGS / የተገኙ ማስታወቂያዎች
                    </div>
                    {suggestions.ads.map((item) => {
                      const thumb = item.ad.images?.[0] || item.ad.image || "";
                      return (
                        <Link
                          key={item.ad.id}
                          to={`/ad/${item.ad.id}`}
                          onClick={() => setShowSuggestions(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "8px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            color: "#0f172a",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={item.resolvedTitle}
                              style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "8px",
                                backgroundColor: "#e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              🛍️
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: "700",
                                fontSize: "14px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.resolvedTitle}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              {item.ad.city || "Ethiopia"} •{" "}
                              {item.numericPrice > 0
                                ? `${item.numericPrice.toLocaleString()} ETB`
                                : "Call for Price"}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                <div style={{ marginTop: "10px", textAlign: "right" }}>
                  <Link
                    to={`/search?q=${encodeURIComponent(searchQuery)}`}
                    style={{ fontSize: "13px", fontWeight: "700", color: "#0052cc", textDecoration: "none" }}
                  >
                    ሁሉንም ውጤቶች በዝርዝር ይመልከቱ →
                  </Link>
                </div>
              </div>
            )}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section style={{ padding: "50px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "30px" }}>
          All Categories
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          {categories.map((c) => {
            const isActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(isActive ? "all" : c.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "36px",
                    backgroundColor: isActive ? "#0052cc" : "white",
                    border: isActive ? "3px solid #0052cc" : "2px solid #e2e8f0",
                    boxShadow: isActive ? "0 8px 20px rgba(0,82,204,0.25)" : "0 2px 8px rgba(0,0,0,0.05)",
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  {c.icon}
                </div>
                <span style={{ fontSize: "15px", fontWeight: isActive ? "700" : "600", color: isActive ? "#0052cc" : "#475569" }}>
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* LATEST ADS SECTION */}
      <section style={{ padding: "20px 20px 60px", maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            {selectedCategory === "all" ? "Latest Listings" : `${selectedCategory} Listings`} ({filteredAds.length})
          </h2>
          <Link
            to={`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`}
            style={{
              backgroundColor: "#0052cc",
              color: "white",
              padding: "10px 18px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            🔎 Advanced & Photo Search
          </Link>
        </div>

        {adsLoading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b", fontSize: "16px" }}>
            Loading marketplace ads...
          </div>
        ) : filteredAds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b", fontSize: "16px" }}>
            ምንም ማስታወቂያ አልተገኘም። ሌላ ቃል ይሞክሩ ወይም በፎቶ ይፈልጉ።
          </div>
        ) : (
          <div className="ad-grid" style={{ display: "grid", gap: "20px" }}>
            {filteredAds.map((ad) => {
              const imgUrl = ad.images?.[0] || ad.image || "";
              return (
                <Link
                  key={ad.id}
                  to={`/ad/${ad.id}`}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ height: "190px", backgroundColor: "#e2e8f0", position: "relative" }}>
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={ad.title || "Ad"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "40px",
                        }}
                      >
                        🛍️
                      </div>
                    )}
                    {ad.category && (
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          backgroundColor: "rgba(15,23,42,0.8)",
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {ad.category}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#0f172a",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ad.title || "Untitled Listing"}
                    </h3>
                    <div style={{ fontSize: "17px", fontWeight: "800", color: "#0052cc" }}>
                      {ad.price ? `${Number(String(ad.price).replace(/[^0-9]/g, "")).toLocaleString()} ETB` : "Call for Price"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "auto" }}>
                      📍 {ad.city || "Ethiopia"} {ad.subcity ? `• ${ad.subcity}` : ""}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* External Abaybot Results */}
        {externalAds.length > 0 && (
          <div style={{ marginTop: "40px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>
              Telegram & External Matches ({externalAds.length})
            </h3>
            <div className="ad-grid" style={{ display: "grid", gap: "20px" }}>
              {externalAds.map((ext, idx) => (
                <div
                  key={ext.id || idx}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "14px",
                    padding: "16px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
                    {ext.title || "External Listing"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#475569" }}>
                    {ext.description || ext.city || ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
