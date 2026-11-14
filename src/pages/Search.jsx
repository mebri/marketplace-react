// FILE: src/pages/Search.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, query as fsQuery, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  ETHIOPIA_CITIES,
  UNIFIED_CATEGORIES,
  searchMarketplaceAds,
} from "../utils/localSearchEngine";
import {
  runExactImageSearch,
  IMAGE_SEARCH_SESSION_KEY,
} from "../utils/imageSearchClient";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [queryText, setQueryText] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  const [visualState, setVisualState] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Sync Firebase Firestore ads
  useEffect(() => {
    try {
      const q = fsQuery(collection(db, "ads"));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setAds(list);
          setLoading(false);
        },
        () => setLoading(false)
      );
      return () => unsub();
    } catch {
      setLoading(false);
    }
  }, []);

  // Load AI Image Search result if navigated from Home camera button
  useEffect(() => {
    if (searchParams.get("mode") === "image") {
      try {
        const saved = sessionStorage.getItem(IMAGE_SEARCH_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setVisualState(parsed);
          if (parsed.exactQuery) setQueryText(parsed.exactQuery);
        }
      } catch {
        // ignore invalid cache
      }
    }
  }, [searchParams]);

  const handleImageFile = async (file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    setImageError("");
    setImageLoading(true);
    try {
      const result = await runExactImageSearch({ file, clientAds: ads });
      sessionStorage.setItem(IMAGE_SEARCH_SESSION_KEY, JSON.stringify(result));
      setVisualState(result);
      if (result.exactQuery) setQueryText(result.exactQuery);
      setSearchParams({ mode: "image" });
    } catch (err) {
      setImageError(err?.message || "AI photo search failed. Please try again.");
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Support Ctrl+V image paste
  useEffect(() => {
    const onPaste = (e) => {
      const items = e.clipboardData?.items || [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            handleImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  const rankedResults = useMemo(() => {
    return searchMarketplaceAds(ads, {
      query: visualState ? "" : queryText,
      category: selectedCategory === "all" ? "" : selectedCategory,
      city: selectedCity,
      condition: selectedCondition,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sortBy,
      visualAnalysis: visualState?.analysis || null,
    });
  }, [
    ads,
    queryText,
    selectedCategory,
    selectedCity,
    selectedCondition,
    minPrice,
    maxPrice,
    sortBy,
    visualState,
  ]);

  const clearVisualSearch = () => {
    setVisualState(null);
    sessionStorage.removeItem(IMAGE_SEARCH_SESSION_KEY);
    setSearchParams(queryText ? { q: queryText } : {});
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "24px 16px 60px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <style>{`
        .search-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        @media (max-width: 1024px) { .search-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 768px) { .search-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 480px) { .search-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        {/* Header + Back */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <Link to="/" style={{ color: "#0052cc", textDecoration: "none", fontWeight: "700", fontSize: "14px" }}>
              ← ወደ ዋናው ገጽ ተመለስ (Home)
            </Link>
            <h1 style={{ margin: "6px 0 0", fontSize: "26px", fontWeight: "900", color: "#0f172a" }}>
              የኛ ገበያ — Smart Text & AI Photo Search
            </h1>
          </div>
        </div>

        {/* Search Input + Photo Upload Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleImageFile(f);
          }}
          style={{
            backgroundColor: dragActive ? "#eff6ff" : "white",
            border: dragActive ? "2px dashed #0052cc" : "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "20px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              value={queryText}
              onChange={(e) => {
                setQueryText(e.target.value);
                if (visualState) setVisualState(null);
              }}
              placeholder="በአማርኛ ወይም በእንግሊዝኛ ይፈልጉ (ምሳሌ: BYD, መኪና, ቦሌ, ግራናይት, RAV4)..."
              style={{
                flex: 1,
                minWidth: "240px",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                fontSize: "15px",
                outline: "none",
              }}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageFile(e.target.files?.[0])}
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageLoading}
              style={{
                backgroundColor: "#0052cc",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 18px",
                fontWeight: "700",
                cursor: imageLoading ? "wait" : "pointer",
              }}
            >
              {imageLoading ? "⏳ AI በመፈተሽ ላይ..." : "📷 በፎቶ ፈልግ (Upload / Paste Photo)"}
            </button>
          </div>

          {imageError && (
            <div style={{ marginTop: "10px", color: "#b91c1c", fontSize: "14px", fontWeight: "600" }}>
              {imageError}
            </div>
          )}

          {/* Filters Row */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc" }}
            >
              <option value="all">All Categories (ሁሉም ምድቦች)</option>
              {UNIFIED_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.amharic})
                </option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc" }}
            >
              <option value="">All Ethiopia Cities (ሁሉም ከተሞች)</option>
              {ETHIOPIA_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.amharic})
                </option>
              ))}
            </select>

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc" }}
            >
              <option value="">Any Condition</option>
              <option value="New">New (አዲስ)</option>
              <option value="Used">Used (ያገለገለ)</option>
              <option value="For Rent">For Rent (ኪራይ)</option>
            </select>

            <input
              type="number"
              placeholder="Min Price (ETB)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ width: "130px", padding: "9px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
            />
            <input
              type="number"
              placeholder="Max Price (ETB)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ width: "130px", padding: "9px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc" }}
            >
              <option value="relevance">Sort: Best Match</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* AI Visual Match Summary Banner */}
        {visualState?.analysis && (
          <div
            style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #93c5fd",
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "22px",
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {visualState.previewDataUrl && (
              <img
                src={visualState.previewDataUrl}
                alt="Query"
                style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "12px", border: "2px solid white" }}
              />
            )}
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#1d4ed8", textTransform: "uppercase" }}>
                AI Visual Match Identified ({visualState.analysis.confidence || "high"} confidence)
              </div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "4px 0" }}>
                {[
                  visualState.analysis.year,
                  visualState.analysis.brand,
                  visualState.analysis.model,
                  visualState.analysis.color,
                ]
                  .filter(Boolean)
                  .join(" ") || visualState.exactQuery}
              </div>
              <div style={{ fontSize: "13px", color: "#334155" }}>{visualState.analysis.summary}</div>
            </div>
            <button
              type="button"
              onClick={clearVisualSearch}
              style={{
                backgroundColor: "white",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                padding: "8px 14px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              ✕ Clear Photo Search
            </button>
          </div>
        )}

        {/* Results Count */}
        <div style={{ marginBottom: "16px", fontWeight: "700", color: "#334155" }}>
          {loading ? "Loading..." : `${rankedResults.length} Results Found`}
        </div>

        {/* Results Grid */}
        {!loading && rankedResults.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "50px 20px",
              borderRadius: "16px",
              textAlign: "center",
              color: "#64748b",
              border: "1px solid #e2e8f0",
            }}
          >
            ምንም ተመሳሳይ ውጤት አልተገኘም። ማጣሪያዎቹን (Filters) አጽድተው እንደገና ይሞክሩ።
          </div>
        ) : (
          <div className="search-grid" style={{ display: "grid", gap: "18px" }}>
            {rankedResults.map((item) => {
              const imgUrl = item.ad.images?.[0] || item.ad.image || "";
              return (
                <Link
                  key={item.ad.id}
                  to={`/ad/${item.ad.id}`}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    textDecoration: "none",
                    color: "inherit",
                    border: item.exactVisualMatch ? "2px solid #16a34a" : "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ height: "180px", backgroundColor: "#e2e8f0", position: "relative" }}>
                    {imgUrl ? (
                      <img src={imgUrl} alt={item.resolvedTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>
                        🛍️
                      </div>
                    )}
                    {item.matchPercentage > 0 && (queryText || visualState) && (
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          backgroundColor: item.exactVisualMatch ? "#15803d" : "#0052cc",
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "800",
                        }}
                      >
                        {item.exactVisualMatch ? `✓ ${item.matchPercentage}% Exact Match` : `${item.matchPercentage}% Match`}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>{item.resolvedTitle}</div>
                    <div style={{ fontWeight: "800", fontSize: "16px", color: "#0052cc" }}>
                      {item.numericPrice > 0 ? `${item.numericPrice.toLocaleString()} ETB` : "Call for Price"}
                    </div>
                    {item.matchReasons.length > 0 && (
                      <div style={{ fontSize: "12px", color: "#15803d", fontWeight: "600" }}>
                        {item.matchReasons.join(" • ")}
                      </div>
                    )}
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "auto" }}>
                      📍 {item.ad.city || "Ethiopia"} {item.ad.subcity ? `• ${item.ad.subcity}` : ""}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
