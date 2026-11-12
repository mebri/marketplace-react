import React, { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Link } from "react-router-dom";

export default function Home() {
  const [ads, setAds] = useState([]); 
  const [externalAds, setExternalAds] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [adsLoading, setAdsLoading] = useState(true);

  // 1. Firebase Sync
  useEffect(() => {
    try {
      const q = query(collection(db, "ads"));
      const unsub = onSnapshot(q, (snapshot) => {
        const fbAds = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        fbAds.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setAds(fbAds);
        setAdsLoading(false);
      }, () => setAdsLoading(false));
      return () => unsub();
    } catch (e) {
      setAdsLoading(false);
    }
  }, []);

  // 2. Search API Call
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) {
      setExternalAds([]);
      return;
    }
    try {
      const res = await fetch(`https://abaybot-worker.yegna.workers.dev/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setExternalAds(data.external || []);
    } catch (error) {
      console.error(error);
    }
  };

  // 3. Filter Ads
  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      if (selectedCategory !== "all") {
        if ((ad.category || "").toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          (ad.title || "").toLowerCase().includes(q) ||
          (ad.city || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ads, selectedCategory, searchQuery]);

  const categories = [
    { id: "Cars", name: "Cars", icon: "🚗" },
    { id: "Houses", name: "Houses", icon: "🏠" },
    { id: "Rentals", name: "Rentals", icon: "🏢" },
    { id: "Electronics", name: "Electronics", icon: "📱" },
    { id: "Furniture", name: "Furniture", icon: "🛋️" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      
      {/* ✅ Keyframe for the animated car */}
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

      {/* ✅ HERO SECTION */}
      <section style={{ background: "linear-gradient(135deg, #0052cc 0%, #0b4fb8 50%, #0a3e9c 100%)", color: "white", padding: "60px 20px 70px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "900", margin: "0 0 15px", letterSpacing: "-1px", textShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>የኛ ገበያ</h1>
        <p style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 15px" }}>Buy • Sell • Rent Across Ethiopia</p>
        <p style={{ fontSize: "16px", color: "#dbeafe", maxWidth: "650px", margin: "0 auto 30px", lineHeight: "1.6" }}>
          Find cars, houses, rentals, electronics, furniture, labor and more anywhere in Ethiopia.
        </p>

        {/* Animated Car */}
        <div style={{ height: "100px", position: "relative", marginBottom: "20px", overflow: "hidden" }}>
          <div className="car-animation">
            <svg viewBox="0 0 280 100" style={{ width: "220px", height: "auto", filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.4))" }}>
              <ellipse cx="140" cy="92" rx="120" ry="6" fill="rgba(0,0,0,0.3)" />
              <path d="M20 70 L30 50 C38 42 55 35 75 35 L165 35 C185 35 210 42 225 50 L255 58 C265 62 270 70 268 76 L262 82 C260 84 256 84 250 84 L216 84 C214 74 205 66 194 66 C183 66 174 74 172 84 L108 84 C106 74 97 66 86 66 C75 66 66 74 64 84 L25 84 C22 84 20 80 20 76 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
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

        {/* Search Bar */}
        <div style={{ maxWidth: "750px", margin: "0 auto" }}>
          <div style={{ display: "flex", backgroundColor: "white", borderRadius: "16px", padding: "6px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <span style={{ fontSize: "20px", margin: "0 15px", alignSelf: "center", color: "#94a3b8" }}>🔍</span>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search cars, houses, furniture, labor and more..." 
              onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
              style={{ flex: 1, border: "none", outline: "none", fontSize: "16px", color: "#1e293b", backgroundColor: "transparent" }} 
            />
            <button 
              onClick={handleSearchSubmit} 
              style={{ backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", cursor: "pointer", fontSize: "18px", fontWeight: "bold", transition: "background 0.2s" }}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ✅ CATEGORIES SECTION */}
      <section style={{ padding: "50px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "30px" }}>All Categories</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          {categories.map((c) => {
            const isActive = selectedCategory === c.id;
            return (
              <button 
                key={c.id} 
                onClick={() => setSelectedCategory(isActive ? "all" : c.id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", background: "none", border: "none", cursor: "pointer", transition: "transform 0.2s" }}
              >
                <div style={{ 
                  width: "80px", height: "80px", borderRadius: "50%", 
                  display: "flex", justifyContent: "center", alignItems: "center", fontSize: "36px", 
                  backgroundColor: isActive ? "#0052cc" : "white", 
                  border: isActive ? "3px solid #0052cc" : "2px solid #e2e8f0", 
                  boxShadow: isActive ? "0 8px 20px rgba(0,82,204,0.25)" : "0 2px 8px rgba(0,0,0,0.05)",
                  transform: isActive ? "scale(1.05)" : "scale(1)"
                }}>
                  {c.icon}
                </div>
                <span style={{ fontSize: "15px", fontWeight: isActive ? "700" : "600", color: isActive ? "#0052cc" : "#475569" }}>{c.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ✅ LATEST ADS SECTION */}
      <section style={{ padding: "20px 20px 60px", maxWidth: "1300px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "25px" }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 5px" }}>
              {searchQuery ? `Results for "${searchQuery}"` : "Latest Advertisements"}
            </h2>
            <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>Recently posted items on የኛ ገበያ</p>
          </div>
        </div>
        
        {adsLoading ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "#64748b" }}>Loading ads...</div>
        ) : filteredAds.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "#64748b" }}>No ads found.</div>
        ) : (
          <div className="ad-grid" style={{ display: "grid", gap: "24px" }}>
            {filteredAds.map((ad) => {
              const img = ad.images?.[0] || ad.image || "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80";
              return (
                <div key={ad.id} style={{ backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", transition: "transform 0.2s" }}>
                  <Link to={`/ad/${ad.id}`} style={{ display: "block", height: "200px", overflow: "hidden", position: "relative" }}>
                    <img src={img} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: "rgba(15, 23, 42, 0.8)", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>{ad.condition || "New"}</span>
                    <span style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "rgba(0, 82, 204, 0.9)", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>{ad.category || "Other"}</span>
                  </Link>
                  <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "17px", fontWeight: "700", margin: "0 0 10px", color: "#0f172a", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ad.title}</h3>
                    <p style={{ fontSize: "20px", fontWeight: "900", color: "#16a34a", margin: "0 0 10px" }}>ETB {Number(ad.price || 0).toLocaleString()}</p>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 15px", display: "flex", alignItems: "center", gap: "5px" }}>📍 {ad.city || "Ethiopia"}</p>
                    <Link to={`/ad/${ad.id}`} style={{ marginTop: "auto", display: "block", textAlign: "center", backgroundColor: "#0052cc", color: "white", padding: "10px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EXTERNAL ADS */}
        {externalAds.length > 0 && (
          <div style={{ marginTop: "50px", borderTop: "2px dashed #cbd5e1", paddingTop: "40px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "25px" }}>From Other Marketplaces</h2>
            <div className="ad-grid" style={{ display: "grid", gap: "24px" }}>
              {externalAds.map((ad) => (
                <div key={ad.id} style={{ backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0" }}>
                  <a href={ad.url} target="_blank" rel="noreferrer" style={{ display: "block", height: "200px", overflow: "hidden", position: "relative" }}>
                    <img src={ad.image} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "rgba(217, 119, 6, 0.9)", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>{ad.source}</span>
                  </a>
                  <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "17px", fontWeight: "700", margin: "0 0 10px", color: "#0f172a", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ad.title}</h3>
                    <p style={{ fontSize: "20px", fontWeight: "900", color: "#16a34a", margin: "0 0 10px" }}>ETB {Number(ad.price).toLocaleString()}</p>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 15px", display: "flex", alignItems: "center", gap: "5px" }}>📍 {ad.city}</p>
                    <a href={ad.url} target="_blank" rel="noreferrer" style={{ marginTop: "auto", display: "block", textAlign: "center", backgroundColor: "#f59e0b", color: "white", padding: "10px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
                      View Source
                    </a>
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
