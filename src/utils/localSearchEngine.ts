// FILE: src/utils/localSearchEngine.js

export const UNIFIED_CATEGORIES = [
  { id: "Cars", name: "Cars", amharic: "መኪኖች", icon: "🚗" },
  { id: "Houses", name: "Houses", amharic: "ቤቶች", icon: "🏠" },
  { id: "Rentals", name: "Rentals", amharic: "ኪራይ", icon: "🏢" },
  { id: "Electronics", name: "Electronics", amharic: "ኤሌክትሮኒክስ", icon: "📱" },
  { id: "Furniture", name: "Furniture", amharic: "ፈርኒቸር", icon: "🛋️" },
  { id: "Clothes", name: "Clothes", amharic: "ልብስ", icon: "👕" },
  { id: "Building Materials", name: "Building Materials", amharic: "ግንባታ", icon: "🧱" },
  { id: "Spare Parts", name: "Spare Parts", amharic: "መለዋወጫ", icon: "🔧" },
  { id: "Labor & Services", name: "Services", amharic: "አገልግሎት", icon: "👷" },
];

export const ETHIOPIA_CITIES = [
  { name: "Addis Ababa", amharic: "አዲስ አበባ" },
  { name: "Adama", amharic: "አዳማ / ናዝሬት" },
  { name: "Hawassa", amharic: "ሀዋሳ" },
  { name: "Bahir Dar", amharic: "ባህር ዳር" },
  { name: "Dire Dawa", amharic: "ድሬዳዋ" },
  { name: "Mekelle", amharic: "መቐለ" },
  { name: "Bishoftu", amharic: "ቢሾፍቱ" },
  { name: "Gondar", amharic: "ጎንደር" },
  { name: "Jimma", amharic: "ጅማ" },
  { name: "Dessie", amharic: "ደሴ" },
  { name: "Shashemene", amharic: "ሻሸመኔ" },
  { name: "Jigjiga", amharic: "ጅግጅጋ" },
  { name: "Harar", amharic: "ሐረር" },
  { name: "Arba Minch", amharic: "አርባ ምንጭ" },
  { name: "Debre Birhan", amharic: "ደብረ ብርሃን" },
  { name: "Hosanna", amharic: "ሆሳዕና" },
  { name: "Wolaita Sodo", amharic: "ወላይታ ሶዶ" },
  { name: "Nekemte", amharic: "ነቀምቴ" },
];

const SYNONYM_GROUPS = [
  ["car", "cars", "auto", "vehicle", "vehicles", "sedan", "suv", "ev", "electric", "hybrid", "plate", "code 2", "code 3", "መኪና", "መኪኖች", "አውቶሞቢል", "ተሽከርካሪ", "ኤሌክትሪክ", "ታርጋ", "ኮድ 2", "ኮድ 3", "ዲውቲ"],
  ["byd", "ባይድ", "ቢዋይዲ", "sealion", "ሲላየን", "seagull", "ሲገል", "dolphin", "atto", "song plus"],
  ["toyota", "ቶዮታ", "ቶዬታ", "corolla", "ኮሮላ", "rav4", "ራቭ4", "vitz", "ቪትዝ", "yaris", "ያሪስ", "hilux", "ሀይሉክስ", "prado", "ፕራዶ", "land cruiser", "ላንድ ክሩዘር", "hiace", "camry"],
  ["hyundai", "ሂዩንዳይ", "ሃዩንዳይ", "ሀዩንዳይ", "elantra", "ኤላንትራ", "tucson", "ቱክሰን", "creta", "santa fe", "i10", "staria", "kona"],
  ["suzuki", "ሱዙኪ", "ሱዚኪ", "swift", "ስዊፍት", "dzire", "ዲዛየር", "alto", "አልቶ", "celerio", "ertiga", "vitara"],
  ["volkswagen", "vw", "id4", "id.4", "id6", "id.6", "tiguan", "ፎልክስዋገን", "ቮልስዋገን"],
  ["isuzu", "fsr", "npr", "d-max", "truck", "pickup", "bajaj", "damas", "ኢሱዙ", "ጭነት", "ባጃጅ"],
  ["house", "houses", "villa", "condo", "condominium", "apartment", "home", "real estate", "land", "plot", "g+1", "g+2", "g+3", "ቤት", "ቤቶች", "ቪላ", "ኮንዶ", "ኮንዶሚኒየም", "አፓርታማ", "ሪል እስቴት", "መሬት", "ቦታ", "ካርታ"],
  ["rent", "rental", "rentals", "lease", "monthly", "shop", "office", "warehouse", "ኪራይ", "የሚከራይ", "ለኪራይ", "ሱቅ", "ቢሮ", "መጋዘን"],
  ["phone", "smartphone", "iphone", "mobile", "samsung", "galaxy", "pixel", "xiaomi", "tecno", "ስልክ", "ሞባይል", "አይፎን", "ሳምሰንግ"],
  ["laptop", "computer", "pc", "macbook", "dell", "hp", "lenovo", "ላፕቶፕ", "ኮምፒውተር", "ማክቡክ"],
  ["tv", "television", "lg", "sony", "fridge", "refrigerator", "washer", "washing machine", "ቴሌቪዥን", "ቲቪ", "ፍሪጅ", "ማጠቢያ"],
  ["electronics", "gadget", "camera", "ps5", "playstation", "ኤሌክትሮኒክስ"],
  ["furniture", "sofa", "bed", "mattress", "table", "chair", "cabinet", "wardrobe", "buffet", "ፈርኒቸር", "ሶፋ", "አልጋ", "ፍራሽ", "ጠረጴዛ", "ወንበር", "ቁምሳጥን", "ቡፌ"],
  ["clothes", "fashion", "shoes", "sneakers", "leather", "jacket", "dress", "suit", "ልብስ", "ጫማ", "ጃኬት", "ቀሚስ", "የቆዳ ጫማ"],
  ["building", "material", "materials", "granite", "marble", "ceramic", "porcelain", "tile", "cement", "rebar", "steel", "gypsum", "paint", "ግንባታ", "ግራናይት", "ማርብል", "ሴራሚክ", "ሲሚንቶ", "ብረት", "ቆርቆሮ", "ብሎኬት"],
  ["spare", "parts", "tire", "tyre", "rim", "battery", "brake", "oil", "filter", "headlight", "bumper", "መለዋወጫ", "ስፔር", "ጎማ", "ባትሪ", "ፍሬን", "ፋሮ", "ዘይት"],
  ["service", "services", "labor", "plumber", "electrician", "driver", "painter", "mechanic", "cleaner", "tutor", "አገልግሎት", "ሠራተኛ", "ቧንቧ", "ሹፌር", "መካኒክ", "ጥገና", "ጽዳት"],
  ["addis ababa", "addis", "አዲስ አበባ", "finfinne"],
  ["bole", "bole bulbula", "bole medhanialem", "bole atlas", "ቦሌ", "ቦሌ ቡልቡላ", "ቦሌ መድሃኒያለም"],
  ["summit", "cmc", "ayat", "tafo", "yeka", "lemi kura", "ሰሚት", "ሲኤምሲ", "አያት", "ጣፎ", "የካ"],
  ["kazanchis", "megenagna", "gerji", "hayahulet", "22", "piassa", "arada", "merkato", "ካዛንቺስ", "መገናኛ", "ገርጂ", "ፒያሳ", "መርካቶ"],
  ["sarbet", "lebu", "jemo", "saris", "kality", "kera", "ሳርቤት", "ለቡ", "ጀሞ", "ሳሪስ", "ቃሊቲ", "ቄራ"],
  ["adama", "nazret", "አዳማ", "ናዝሬት"],
  ["hawassa", "awassa", "ሀዋሳ", "አዋሳ"],
  ["bahir dar", "ባህር ዳር"],
  ["dire dawa", "ድሬዳዋ"],
  ["mekelle", "መቐለ", "መቀሌ"],
  ["bishoftu", "debre zeit", "ቢሾፍቱ"],
  ["gondar", "ጎንደር"],
  ["jimma", "ጅማ"],
  ["dessie", "kombolcha", "ደሴ", "ኮምቦልቻ"],
];

const TOKEN_SYNONYM_INDEX = new Map();
for (const group of SYNONYM_GROUPS) {
  for (const term of group) {
    const existing = TOKEN_SYNONYM_INDEX.get(term) || [];
    TOKEN_SYNONYM_INDEX.set(term, Array.from(new Set([...existing, ...group])));
  }
}

export function normalizeEthiopicNumerals(text) {
  const str = String(text || "");
  const ethMap = {
    "፩": 1, "፪": 2, "፫": 3, "፬": 4, "፭": 5, "፮": 6, "፯": 7, "፰": 8, "፱": 9,
    "፲": 10, "፳": 20, "፴": 30, "፵": 40, "፶": 50, "፷": 60, "፸": 70, "፹": 80, "፺": 90,
    "፻": 100, "፼": 10000,
  };
  return str.replace(/[፩-፼]+/g, (match) => {
    let total = 0;
    let current = 0;
    for (const ch of match) {
      const val = ethMap[ch] || 0;
      if (val === 100 || val === 10000) {
        current = current === 0 ? val : current * val;
        if (val === 10000) {
          total += current;
          current = 0;
        }
      } else {
        current += val;
      }
    }
    return String(total + current);
  });
}

export function normalizeSearchText(raw) {
  return normalizeEthiopicNumerals(String(raw || ""))
    .toLowerCase()
    .replace(/[_/\\|,+&•·.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactAlnum(raw) {
  return normalizeSearchText(raw).replace(/\s+/g, "");
}

export function parseNumericPrice(price) {
  if (typeof price === "number" && Number.isFinite(price)) return Math.round(price);
  const cleaned = normalizeEthiopicNumerals(String(price || "")).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? Math.round(num) : 0;
}

export function normalizeCategory(rawCategory, fallbackText = "") {
  const combined = `${rawCategory || ""} ${fallbackText || ""}`.toLowerCase();
  if (/rent|lease|ኪራይ|ለኪራይ|የሚከራይ/.test(combined)) return "Rentals";
  if (/car|vehicle|auto|byd|toyota|hyundai|suzuki|corolla|rav4|vitz|elantra|tucson|swift|dzire|isuzu|ferrari|መኪና|ተሽከርካሪ/.test(combined)) return "Cars";
  if (/house|villa|condo|apartment|real estate|land|ቤት|ቪላ|ኮንዶ|አፓርታማ|መሬት/.test(combined)) return "Houses";
  if (/phone|iphone|samsung|laptop|macbook|computer|tv|fridge|electronics|ስልክ|ላፕቶፕ|ቲቪ|ፍሪጅ/.test(combined)) return "Electronics";
  if (/sofa|bed|mattress|table|chair|furniture|wardrobe|ሶፋ|አልጋ|ፍራሽ|ጠረጴዛ|ወንበር|ፈርኒቸር/.test(combined)) return "Furniture";
  if (/cloth|shoe|dress|jacket|suit|fashion|ልብስ|ጫማ|ቀሚስ|ጃኬት/.test(combined)) return "Clothes";
  if (/granite|marble|ceramic|cement|rebar|steel|paint|building|ግራናይት|ማርብል|ሲሚንቶ|ብረት|ግንባታ/.test(combined)) return "Building Materials";
  if (/spare|tire|tyre|battery|brake|headlight|bumper|መለዋወጫ|ጎማ|ባትሪ/.test(combined)) return "Spare Parts";
  if (/service|labor|plumber|electrician|driver|mechanic|አገልግሎት|ሠራተኛ|ጥገና/.test(combined)) return "Labor & Services";

  const exact = UNIFIED_CATEGORIES.find(
    (c) => c.id.toLowerCase() === String(rawCategory || "").trim().toLowerCase()
  );
  return exact ? exact.id : (rawCategory || "Electronics");
}

function detectBrandModelYear(text) {
  const clean = normalizeSearchText(text);
  const brands = [
    "Toyota", "BYD", "Hyundai", "Suzuki", "Volkswagen", "VW", "Nissan", "Kia",
    "Mercedes", "BMW", "Isuzu", "Mitsubishi", "Ford", "Ferrari", "Honda",
    "Apple", "iPhone", "Samsung", "HP", "Dell", "Lenovo", "Sony", "LG",
  ];
  let brand = "";
  for (const b of brands) {
    if (clean.includes(b.toLowerCase())) {
      brand = b === "iPhone" ? "Apple" : b;
      break;
    }
  }
  const yearMatch = clean.match(/\b(199\d|20[0-2]\d)\b/);
  return { brand, model: "", year: yearMatch ? yearMatch[1] : "" };
}

function getAdTimestamp(ad) {
  const c = ad?.createdAt;
  if (!c) return 0;
  if (typeof c === "number") return c;
  if (typeof c?.toMillis === "function") return c.toMillis();
  if (typeof c === "object" && typeof c.seconds === "number") return c.seconds * 1000;
  if (c instanceof Date) return c.getTime();
  const parsed = new Date(c).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function expandSearchToken(token) {
  const clean = normalizeSearchText(token);
  if (!clean) return [];
  const results = new Set([clean]);

  const direct = TOKEN_SYNONYM_INDEX.get(clean);
  if (direct) {
    for (const syn of direct) results.add(syn);
  }
  if (clean.length >= 3) {
    for (const [key, group] of TOKEN_SYNONYM_INDEX.entries()) {
      if (key.length >= 3 && (key.includes(clean) || clean.includes(key))) {
        for (const syn of group) results.add(syn);
      }
    }
  }
  return Array.from(results);
}

export function searchMarketplaceAds(ads = [], options = {}) {
  const {
    query = "",
    category = "",
    condition = "",
    city = "",
    minPrice,
    maxPrice,
    sort = "relevance",
    visualAnalysis = null,
  } = options;

  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const normalizedCategoryFilter = category && category !== "all" ? normalizeCategory(category) : "";
  const normalizedConditionFilter = normalizeSearchText(condition);
  const normalizedCityFilter = normalizeSearchText(city);
  const cityVariants = normalizedCityFilter ? expandSearchToken(normalizedCityFilter) : [];

  const vBrand = normalizeSearchText(visualAnalysis?.brand || "");
  const vModel = normalizeSearchText(visualAnalysis?.model || "");
  const vYear = normalizeSearchText(visualAnalysis?.year || "");
  const vColor = normalizeSearchText(visualAnalysis?.color || "");
  const vCat = visualAnalysis?.category ? normalizeCategory(visualAnalysis.category) : "";
  const vKeywords = Array.from(
    new Set([...(visualAnalysis?.keywords || []), ...(visualAnalysis?.visualMarkers || [])])
  )
    .map((k) => normalizeSearchText(k))
    .filter((k) => k.length >= 2);
  const verifiedMap = visualAnalysis?.verifiedCandidates || {};
  const hasVisualQuery = Boolean(
    visualAnalysis && (vBrand || vModel || vCat || vKeywords.length > 0 || visualAnalysis.exactQuery)
  );

  const scoredResults = [];

  for (const ad of ads) {
    if (!ad) continue;
    const resolvedCategory = normalizeCategory(ad.category, `${ad.title || ""} ${ad.description || ""}`);
    const resolvedTitle = (ad.title || ad.description || "Marketplace Item").trim();
    const numericPrice = parseNumericPrice(ad.price);
    const meta = detectBrandModelYear(`${resolvedTitle} ${ad.description || ""}`);

    const titleLower = normalizeSearchText(resolvedTitle);
    const descLower = normalizeSearchText(ad.description || "");
    const catLower = normalizeSearchText(resolvedCategory);
    const subcatLower = normalizeSearchText(ad.subcategory || "");
    const cityLower = normalizeSearchText(`${ad.city || ""} ${ad.subcity || ""}`);
    const condLower = normalizeSearchText(ad.condition || "");
    const brandLower = normalizeSearchText(meta.brand);
    const fullText = `${titleLower} ${brandLower} ${catLower} ${subcatLower} ${cityLower} ${condLower} ${descLower}`;
    const fullCompact = compactAlnum(fullText);

    if (normalizedCategoryFilter && resolvedCategory.toLowerCase() !== normalizedCategoryFilter.toLowerCase()) {
      continue;
    }
    if (normalizedConditionFilter && !condLower.includes(normalizedConditionFilter)) {
      continue;
    }
    if (
      normalizedCityFilter &&
      !cityVariants.some((variant) => cityLower.includes(variant) || fullText.includes(variant))
    ) {
      continue;
    }
    if (typeof minPrice === "number" && minPrice > 0 && numericPrice < minPrice) {
      continue;
    }
    if (typeof maxPrice === "number" && maxPrice > 0 && numericPrice > maxPrice) {
      continue;
    }

    let score = 0;
    const reasons = [];

    if (queryTokens.length > 0) {
      let matchedTokens = 0;

      if (titleLower.includes(normalizedQuery)) {
        score += 55;
        reasons.push("Exact Title Match");
      } else if (fullText.includes(normalizedQuery) || fullCompact.includes(compactAlnum(normalizedQuery))) {
        score += 35;
      }

      for (const token of queryTokens) {
        const variants = expandSearchToken(token);
        let tokenScore = 0;
        for (const variant of variants) {
          const mult = variant === token ? 1 : 0.78;
          const compactVariant = variant.replace(/\s+/g, "");
          if (titleLower.includes(variant)) tokenScore = Math.max(tokenScore, Math.round(30 * mult));
          else if (brandLower && brandLower.includes(variant)) tokenScore = Math.max(tokenScore, Math.round(26 * mult));
          else if (catLower.includes(variant) || subcatLower.includes(variant)) tokenScore = Math.max(tokenScore, Math.round(20 * mult));
          else if (cityLower.includes(variant)) tokenScore = Math.max(tokenScore, Math.round(22 * mult));
          else if (descLower.includes(variant)) tokenScore = Math.max(tokenScore, Math.round(13 * mult));
          else if (compactVariant.length >= 4 && fullCompact.includes(compactVariant)) {
            tokenScore = Math.max(tokenScore, Math.round(16 * mult));
          }
        }
        if (tokenScore > 0) {
          matchedTokens += 1;
          score += tokenScore;
        }
      }

      if (matchedTokens === 0 && !hasVisualQuery) continue;
      if (matchedTokens === queryTokens.length && queryTokens.length > 1) score += 22;
    }

    let exactVisualMatch = false;
    let verifiedScoreOverride = null;

    if (hasVisualQuery) {
      let visualScore = 0;
      if (vBrand && (titleLower.includes(vBrand) || brandLower.includes(vBrand) || descLower.includes(vBrand))) {
        visualScore += 42;
        reasons.push(`Exact Make: ${visualAnalysis.brand}`);
      }
      if (vModel) {
        const vModelCompact = vModel.replace(/\s+/g, "");
        if (titleLower.includes(vModel) || descLower.includes(vModel) || (vModelCompact.length >= 4 && fullCompact.includes(vModelCompact))) {
          visualScore += 50;
          reasons.push(`Exact Model: ${visualAnalysis.model}`);
        }
      }
      if (vYear && (titleLower.includes(vYear) || meta.year === vYear || descLower.includes(vYear))) {
        visualScore += 18;
        reasons.push(`Year: ${visualAnalysis.year}`);
      }
      if (vCat && resolvedCategory.toLowerCase() === vCat.toLowerCase()) {
        visualScore += 18;
        reasons.push(`Category: ${resolvedCategory}`);
      }
      if (vColor && fullText.includes(vColor)) {
        visualScore += 12;
        reasons.push(`Color: ${visualAnalysis.color}`);
      }
      let kwHits = 0;
      for (const kw of vKeywords) {
        if (expandSearchToken(kw).some((v) => fullText.includes(v))) kwHits += 1;
      }
      if (kwHits > 0) visualScore += Math.min(30, kwHits * 8);

      const verified = verifiedMap[ad.id];
      if (verified && typeof verified.similarityScore === "number") {
        const aiSim = Math.max(0, Math.min(100, Math.round(verified.similarityScore)));
        verifiedScoreOverride = aiSim;
        if (verified.exactSameItem || aiSim >= 85) {
          exactVisualMatch = true;
          visualScore += 120 + aiSim;
        } else {
          visualScore += Math.round(aiSim * 0.9);
        }
        if (Array.isArray(verified.visualMatchReasons)) {
          for (const vr of verified.visualMatchReasons.slice(0, 2)) {
            if (vr && !reasons.includes(vr)) reasons.unshift(vr);
          }
        }
      }

      if (visualScore < 18 && queryTokens.length === 0 && !verified) continue;
      score += visualScore;
    }

    const maxPossible = hasVisualQuery ? 140 : Math.max(45, queryTokens.length * 30 + 35);
    const computedPct = score > 0 ? Math.min(99, Math.max(38, Math.round((score / maxPossible) * 100))) : 0;
    const matchPercentage = verifiedScoreOverride !== null ? verifiedScoreOverride : computedPct;

    scoredResults.push({
      ad,
      resolvedTitle,
      resolvedCategory,
      resolvedSubcategory: ad.subcategory || "",
      numericPrice,
      matchScore: score,
      matchPercentage,
      matchReasons: Array.from(new Set(reasons)).slice(0, 3),
      exactVisualMatch,
    });
  }

  scoredResults.sort((a, b) => {
    if (sort === "price-low") return (a.numericPrice || Number.MAX_SAFE_INTEGER) - (b.numericPrice || Number.MAX_SAFE_INTEGER);
    if (sort === "price-high") return b.numericPrice - a.numericPrice;
    if (sort === "newest") return getAdTimestamp(b.ad) - getAdTimestamp(a.ad);
    if ((queryTokens.length > 0 || hasVisualQuery) && b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return getAdTimestamp(b.ad) - getAdTimestamp(a.ad);
  });

  return scoredResults;
}

export function getAutocompleteSuggestions(ads = [], query = "", maxAds = 6) {
  const cleanQuery = normalizeSearchText(query);
  if (!cleanQuery) return { categories: [], brands: [], locations: [], ads: [] };
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  const catCounts = new Map();
  for (const ad of ads) {
    const cat = normalizeCategory(ad.category, `${ad.title || ""} ${ad.description || ""}`);
    catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
  }

  const categories = UNIFIED_CATEGORIES.filter((cat) => {
    const hay = normalizeSearchText(`${cat.id} ${cat.name} ${cat.amharic}`);
    return tokens.some((t) => expandSearchToken(t).some((v) => hay.includes(v)));
  })
    .slice(0, 3)
    .map((c) => ({ ...c, count: catCounts.get(c.id) || 0 }));

  const popularBrands = [
    { label: "BYD Electric Cars (ባይድ)", query: "BYD", category: "Cars" },
    { label: "Toyota Vehicles (ቶዮታ)", query: "Toyota", category: "Cars" },
    { label: "Hyundai Vehicles (ሂዩንዳይ)", query: "Hyundai", category: "Cars" },
    { label: "Suzuki Cars (ሱዙኪ)", query: "Suzuki", category: "Cars" },
    { label: "Apple iPhone (አይፎን)", query: "iPhone", category: "Electronics" },
    { label: "Granite & Marble (ግራናይት)", query: "Granite", category: "Building Materials" },
  ];

  const brands = popularBrands
    .filter((b) => {
      const target = normalizeSearchText(`${b.label} ${b.query} ${b.category}`);
      return tokens.some((t) => expandSearchToken(t).some((v) => target.includes(v)));
    })
    .slice(0, 3);

  const locationItems = [
    { label: "Addis Ababa (አዲስ አበባ)", query: "Addis Ababa" },
    { label: "Bole • Summit • CMC (ቦሌ)", query: "Bole" },
    { label: "Adama / Nazret (አዳማ)", query: "Adama" },
    { label: "Hawassa (ሀዋሳ)", query: "Hawassa" },
    { label: "Bahir Dar (ባህር ዳር)", query: "Bahir Dar" },
    { label: "Dire Dawa (ድሬዳዋ)", query: "Dire Dawa" },
  ];

  const locations = locationItems
    .filter((loc) => {
      const target = normalizeSearchText(`${loc.label} ${loc.query}`);
      return tokens.some((t) => expandSearchToken(t).some((v) => target.includes(v)));
    })
    .slice(0, 2);

  const rankedAds = searchMarketplaceAds(ads, { query, sort: "relevance" }).slice(0, maxAds);
  return { categories, brands, locations, ads: rankedAds };
}
