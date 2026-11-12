import React, { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { MarketplaceHero } from "../components/marketplace/MarketplaceHero";
import { CategoriesSection } from "../components/marketplace/CategoriesSection";
import { LatestAdsSection } from "../components/marketplace/LatestAdsSection";

export default function Home() {
  // ✅ Removed the missing INITIAL_MARKETPLACE_ADS. Defaults to empty array, filled by Firebase.
  const [ads, setAds] = useState([]); 
  const [externalAds, setExternalAds] = useState([]); // 👈 NEW: For Jiji/FB results
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [adsLoading, setAdsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // ✅ YOUR EXACT FIREBASE LISTENER
  useEffect(() => {
    try {
      const q = query(collection(db, "ads"));
      const unsub = onSnapshot(q, (snapshot) => {
        const fbAds = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        fbAds.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setAds(fbAds);
        setAdsLoading(false);
      }, (err) => {
        console.warn("Firestore sync error:", err.message);
        setAdsLoading(false);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Firebase not initialized:", e.message);
      setAdsLoading(false);
    }
  }, []);

  // ✅ NEW: Search API Call
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) {
      setExternalAds([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://abaybot-worker.yegna.workers.dev/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      // 🚨 DEBUG ALERT: Confirms the search worked!
      alert("✅ Backend returned " + (data.external ? data.external.length : 0) + " external ads.");
      
      setExternalAds(data.external || []);
    } catch (error) {
      alert("❌ Search Error: " + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  // ✅ YOUR EXACT FILTER LOGIC
  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      if (selectedCategory !== "all") {
        if ((ad.category || "").toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          (ad.title || "").toLowerCase().includes(q) ||
          (ad.city || "").toLowerCase().includes(q) ||
          (ad.subcity || "").toLowerCase().includes(q) ||
          (ad.description || "").toLowerCase().includes(q) ||
          (ad.category || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ads, selectedCategory, searchQuery]);

  return (
    <div className="home-page min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <main className="flex-1">
        
        {/* 1. HERO */}
        <MarketplaceHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
        />

        {/* 2. CATEGORIES */}
        <CategoriesSection
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* 3. YOUR FIREBASE ADS */}
        <div id="latest-ads-section">
          <LatestAdsSection
            title={searchQuery ? `Results in Yegna Gebeya for "${searchQuery}"` : "Latest Advertisements"}
            subtitle="Recently posted items on የኛ ገበያ"
            ads={filteredAds}
            loading={adsLoading}
            onViewAll={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setExternalAds([]);
            }}
          />
        </div>

        {/* 🚨 DEBUG BANNER */}
        <div style={{ background: "#fef08a", padding: "15px", textAlign: "center", margin: "20px", borderRadius: "10px", fontWeight: "bold" }}>
          Debug Status: {externalAds.length} external ads found.
        </div>

        {/* 4. EXTERNAL ADS (JIJI / FACEBOOK) */}
        {isSearching && (
          <div className="text-center py-10 font-bold text-blue-600 animate-pulse">
            Searching Ethiopian Marketplaces...
          </div>
        )}
        
        {!isSearching && externalAds.length > 0 && (
          <div className="mt-8 border-t-2 border-dashed border-slate-300 pt-8 pb-12">
            <LatestAdsSection
              title="From Other Ethiopian Marketplaces"
              subtitle="Results from Jiji, Facebook & Telegram"
              ads={externalAds}
              loading={false}
              isExternal={true} 
            />
          </div>
        )}

      </main>
    </div>
  );
}