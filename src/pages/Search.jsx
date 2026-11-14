import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  Camera,
  Loader2,
  Search as SearchIcon,
  Sparkles,
  X,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { CategoryIcon } from "../components/marketplace/CategoryIcon";
import { UNIFIED_CATEGORIES } from "../utils/categoryClassifier";
import {
  ETHIOPIA_CITIES,
  mergeAndDedupeAds,
  searchMarketplaceAds,
} from "../utils/localSearchEngine";
import {
  IMAGE_SEARCH_SESSION_KEY,
  runExactImageSearch,
} from "../utils/imageSearchClient";

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlSearchText = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlCondition = searchParams.get("condition") || "";
  const urlSubcategory = searchParams.get("subcategory") || "";
  const urlType = searchParams.get("type") || "";
  const urlCity = searchParams.get("city") || "";
  const urlMode = searchParams.get("mode") || "";

  const [allAds, setAllAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [queryInput, setQueryInput] = useState(urlSearchText);
  const [categoryFilter, setCategoryFilter] = useState(urlCategory);
  const [cityFilter, setCityFilter] = useState(urlCity);
  const [conditionFilter, setConditionFilter] = useState(urlCondition);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const [imageSearching, setImageSearching] = useState(false);
  const [imageSearchError, setImageSearchError] = useState("");
  const [visualState, setVisualState] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { setQueryInput(urlSearchText); }, [urlSearchText]);
  useEffect(() => { setCategoryFilter(urlCategory); }, [urlCategory]);
  useEffect(() => { setCityFilter(urlCity); }, [urlCity]);
  useEffect(() => { setConditionFilter(urlCondition); }, [urlCondition]);

  useEffect(() => {
    if (urlMode === "image") {
      try {
        const raw = sessionStorage.getItem(IMAGE_SEARCH_SESSION_KEY);
        if (raw) {
          setVisualState(JSON.parse(raw));
        }
      } catch {}
    } else if (!urlMode && visualState && !urlSearchText) {
      setVisualState(null);
    }
  }, [urlMode]);

  useEffect(() => {
    let active = true;
    const loadAllMarketplaceAds = async () => {
      setLoading(true);
      let firestoreAds = [];
      let apiAds = [];

      const [fsResult, apiResult] = await Promise.allSettled([
        getDocs(collection(db, "ads")),
        fetch("/api/ads").then((r) => (r.ok ? r.json() : { ads: [] })),
      ]);

      if (fsResult.status === "fulfilled") {
        firestoreAds = fsResult.value.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
      }

      if (apiResult.status === "fulfilled" && Array.isArray(apiResult.value?.ads)) {
        apiAds = apiResult.value.ads;
      }

      if (active) {
        setAllAds(mergeAndDedupeAds(firestoreAds, apiAds));
        setLoading(false);
      }
    };

    loadAllMarketplaceAds();
    return () => { active = false; };
  }, []);

  const executeImageFileSearch = async (file) => {
    if (!file || !file.type?.startsWith("image/")) {
      setImageSearchError("Please choose a valid image file (JPG, PNG, or WebP).");
      return;
    }

    setImageSearchError("");
    setImageSearching(true);
    try {
      const result = await runExactImageSearch({ file, clientAds: allAds });
      const payload = {
        previewDataUrl: result.previewDataUrl,
        analysis: result.analysis,
        exactQuery: result.exactQuery,
        matches: result.matches,
        createdAt: Date.now(),
      };
      setVisualState(payload);
      setQueryInput(result.exactQuery || "");
      setCategoryFilter("");
      try {
        sessionStorage.setItem(IMAGE_SEARCH_SESSION_KEY, JSON.stringify(payload));
      } catch {}
      navigate(`/search?mode=image&search=${encodeURIComponent(result.exactQuery || "")}`, {
        replace: true,
      });
    } catch (err) {
      setImageSearchError(err?.message || "Could not analyze image. Please try another photo.");
    } finally {
      setImageSearching(false);
    }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            executeImageFileSearch(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [allAds]);

  const handleSubmitTextSearch = (e) => {
    if (e) e.preventDefault();
    setVisualState(null);
    const next = new URLSearchParams();
    if (queryInput.trim()) next.set("search", queryInput.trim());
    if (categoryFilter) next.set("category", categoryFilter);
    if (cityFilter) next.set("city", cityFilter);
    if (conditionFilter) next.set("condition", conditionFilter);
    if (urlSubcategory) next.set("subcategory", urlSubcategory);
    if (urlType) next.set("type", urlType);
    setSearchParams(next);
  };

  const handleUploadImageSearch = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await executeImageFileSearch(file);
  };

  const clearImageSearch = () => {
    setVisualState(null);
    setImageSearchError("");
    sessionStorage.removeItem(IMAGE_SEARCH_SESSION_KEY);
    const next = new URLSearchParams(searchParams);
    next.delete("mode");
    setSearchParams(next);
  };

  const availableCities = useMemo(() => {
    const citySet = new Set(ETHIOPIA_CITIES.map((c) => c.name));
    for (const ad of allAds) {
      if (ad.city && String(ad.city).trim()) {
        citySet.add(String(ad.city).trim());
      }
    }
    return Array.from(citySet);
  }, [allAds]);

  const rankedResults = useMemo(() => {
    const minVal = minPrice ? Number(minPrice) : undefined;
    const maxVal = maxPrice ? Number(maxPrice) : undefined;

    if (visualState?.analysis) {
      const scored = searchMarketplaceAds(allAds, {
        query: "",
        category: categoryFilter || "",
        condition: conditionFilter,
        subcategory: urlSubcategory,
        type: urlType,
        city: cityFilter,
        minPrice: minVal,
        maxPrice: maxVal,
        sort: sortBy,
        visualAnalysis: visualState.analysis,
      });

      if (scored.length > 0) return scored;
      if (Array.isArray(visualState.matches) && visualState.matches.length > 0) {
        return visualState.matches;
      }
    }

    return searchMarketplaceAds(allAds, {
      query: queryInput,
      category: categoryFilter,
      condition: conditionFilter,
      subcategory: urlSubcategory,
      type: urlType,
      city: cityFilter,
      minPrice: minVal,
      maxPrice: maxVal,
      sort: sortBy,
    });
  }, [
    allAds,
    queryInput,
    categoryFilter,
    conditionFilter,
    urlSubcategory,
    urlType,
    cityFilter,
    minPrice,
    maxPrice,
    sortBy,
    visualState,
  ]);

  let resultTitle = "All Ethiopia Marketplace Listings";
  if (visualState?.analysis) {
    resultTitle = `AI Exact Image Match: "${visualState.exactQuery || visualState.analysis.category}"`;
  } else if (queryInput.trim()) {
    resultTitle = `Search: "${queryInput.trim()}"`;
  }
  if (categoryFilter) resultTitle += ` • ${categoryFilter}`;
  if (cityFilter) resultTitle += ` • ${cityFilter}`;
  if (urlSubcategory) resultTitle += ` • ${urlSubcategory}`;
  if (conditionFilter) resultTitle += ` • ${conditionFilter}`;
  if (urlType) resultTitle += ` • ${urlType}`;

  return (
    <div
      className="cars-page max-w-7xl mx-auto px-4 py-6"
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) executeImageFileSearch(file);
      }}
    >
      <div className="mb-5">
        <h1 className="!mb-1">🔎 Ethiopia All-Marketplace &amp; AI Exact Image Search</h1>
        <p className="text-center text-sm text-slate-600">
          {resultTitle} ({rankedResults.length} {rankedResults.length === 1 ? "result" : "results"})
        </p>
      </div>

      <div className={`bg-white rounded-2xl border shadow-sm p-4 mb-6 transition-colors ${dragActive ? "border-blue-500 bg-blue-50/40" : "border-slate-200"}`}>
        <form onSubmit={handleSubmitTextSearch} className="flex flex-wrap gap-2.5 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search anywhere in Ethiopia (English / አማርኛ: BYD, Toyota, መኪና, ቤት, Bole, Adama, Hawassa, iPhone)..."
              className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-none text-sm text-slate-900"
            />
            {queryInput && (
              <button
                type="button"
                onClick={() => {
                  setQueryInput("");
                  if (!visualState) {
                    const next = new URLSearchParams(searchParams);
                    next.delete("search");
                    setSearchParams(next);
                  }
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Clear search text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadImageSearch} />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageSearching}
            className="h-11 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-sm inline-flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            {imageSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span>{imageSearching ? "Comparing Photos..." : "AI Image Search"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="h-11 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm inline-flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <button type="submit" className="h-11 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors shadow-sm">
            Search
          </button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800">
                <option value="">All Categories</option>
                {UNIFIED_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.amharic})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Ethiopia City / Area</label>
              <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800">
                <option value="">All Ethiopia</option>
                {availableCities.map((cName) => {
                  const meta = ETHIOPIA_CITIES.find((item) => item.name === cName);
                  return (
                    <option key={cName} value={cName}>{meta ? `${meta.name} (${meta.amharic})` : cName}</option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Condition</label>
              <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800">
                <option value="">Any Condition</option>
                <option value="New">New (አዲስ)</option>
                <option value="Used">Used (ያገለገለ)</option>
                <option value="For Rent">For Rent (ኪራይ)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Min Price (ETB)</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Max Price (ETB)</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Sort Order</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-800">
                <option value="relevance">Best Match</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            All Ethiopia local index (Addis Ababa, Bole, Summit, CMC, Adama, Hawassa, Bahir Dar, Dire Dawa, Mekelle+)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            Tip: Upload, drag &amp; drop, or paste (Ctrl+V) a photo to find exact visual matches
          </span>
        </div>

        {imageSearchError && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between gap-2">
            <span>{imageSearchError}</span>
            <button type="button" onClick={() => setImageSearchError("")} className="p-1"><X className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {visualState?.analysis && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-white border border-blue-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {visualState.previewDataUrl && (
            <img src={visualState.previewDataUrl} alt="Uploaded search reference" className="w-24 h-24 rounded-xl object-cover border-2 border-white shadow shrink-0 bg-slate-100" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md">
                <Sparkles className="w-3.5 h-3.5" />
                AI Exact Visual Identification
              </span>
              {visualState.analysis.confidence && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Confidence: {visualState.analysis.confidence}
                </span>
              )}
              {Number(visualState.analysis.visualVerifiedCount) > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Photo-Verified ({visualState.analysis.visualVerifiedCount} listings compared)
                </span>
              )}
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {visualState.exactQuery || [visualState.analysis.year, visualState.analysis.brand, visualState.analysis.model].filter(Boolean).join(" ") || visualState.analysis.category}
            </h2>
            {visualState.analysis.summary && <p className="text-sm text-slate-600 mt-0.5">{visualState.analysis.summary}</p>}
          </div>
          <button type="button" onClick={clearImageSearch} className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 shrink-0">
            Clear Image Search
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-14 text-slate-600 font-semibold">Loading Ethiopia marketplace listings...</div>
      ) : rankedResults.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-14 px-6">
          <h2 className="text-xl font-bold text-slate-800 mb-2">No matching advertisements found</h2>
          <p className="text-sm text-slate-500 mb-5">Try different keywords (English or Amharic), select All Ethiopia cities, or upload a photo to match visually.</p>
          <button
            type="button"
            onClick={() => { setQueryInput(""); setCategoryFilter(""); setCityFilter(""); setConditionFilter(""); setMinPrice(""); setMaxPrice(""); clearImageSearch(); }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
          >
            Show All Listings
          </button>
        </div>
      ) : (
        <div className="cars-grid">
          {rankedResults.map(({ ad, resolvedTitle, resolvedCategory, resolvedSubcategory, numericPrice, matchPercentage, matchReasons, exactVisualMatch }) => {
            const adImage = Array.isArray(ad.images) && ad.images.length > 0 ? ad.images[0] : ad.image;
            const descriptionText = ad.description
              ? ad.description.length > 120 ? `${ad.description.substring(0, 120)}...` : ad.description
              : "No description provided.";

            return (
              <div className={`car-card relative flex flex-col ${exactVisualMatch ? "ring-2 ring-emerald-500" : ""}`} key={ad.id}>
                {visualState && matchPercentage > 0 && (
                  <div className={`absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg text-white text-xs font-extrabold shadow ${exactVisualMatch ? "bg-emerald-600" : "bg-blue-600"}`}>
                    {matchPercentage}% {exactVisualMatch ? "Exact Visual Match" : "Match"}
                  </div>
                )}

                <Link to={`/ad/${ad.id}`} className="block">
                  {adImage ? (
                    <img
                      src={adImage}
                      alt={resolvedTitle}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (!e.currentTarget.src.endsWith("/mycar.png")) {
                          e.currentTarget.src = "/mycar.png";
                        }
                      }}
                    />
                  ) : (
                    <div className="listing-image">📷</div>
                  )}
                </Link>

                <div className="car-info flex-1 flex flex-col">
                  <span className="category inline-flex items-center gap-1.5 w-fit">
                    <CategoryIcon categoryId={resolvedCategory} className="w-3.5 h-3.5" />
                    <span>{resolvedCategory}</span>
                  </span>
                  <h3>{resolvedTitle}</h3>
                  <h2>ETB {Number(numericPrice || 0).toLocaleString()}</h2>
                  {matchReasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-1.5">
                      {matchReasons.map((reason) => (
                        <span key={reason} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          ✓ {reason}
                        </span>
                      ))}
                    </div>
                  )}
                  {ad.city && <p>📍 {ad.city}{ad.subcity ? ` • ${ad.subcity}` : ""}</p>}
                  {ad.condition && <p>🔄 Condition: {ad.condition}</p>}
                  {resolvedSubcategory && <p>📂 {resolvedSubcategory}</p>}
                  <p className="text-slate-600 text-sm line-clamp-2 mb-3">{descriptionText}</p>
                  <Link to={`/ad/${ad.id}`} className="mt-auto block">
                    <button type="button" style={{ width: "100%", background: "#2e7d32", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
                      View Details
                    </button>
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
