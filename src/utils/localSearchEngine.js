// FILE: src/utils/localSearchEngine.js

export const UNIFIED_CATEGORIES = [
  { id: "Cars", name: "Cars", amharic: "መኪና" },
  { id: "Houses", name: "Houses", amharic: "ቤት" },
  { id: "Rentals", name: "Rentals", amharic: "ኪራይ" },
  { id: "Electronics", name: "Electronics", amharic: "ኤሌክትሮኒክስ" },
  { id: "Furniture", name: "Furniture", amharic: "ፈርኒቸር" },
  { id: "Clothes", name: "Clothes", amharic: "ልብስና ጫማ" },
  { id: "Building Materials", name: "Building Materials", amharic: "የግንባታ እቃ" },
  { id: "Spare Parts", name: "Spare Parts", amharic: "መለዋወጫ" },
  { id: "Labor & Services", name: "Labor & Services", amharic: "ሠራተኛ እና አገልግሎት" },
  { id: "ምንአለሽ ተራ", name: "ምንአለሽ ተራ", amharic: "ያገለገሉ እቃዎች" },
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

export const SYNONYM_GROUPS = [
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
  ["min alesh", "min alesh tera", "used", "second hand", "ምንአለሽ", "ምንአለሽ ተራ", "ያገለገለ"],
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

const ETHIOPIC_VALUES = {
  "፩": 1, "፪": 2, "፫": 3, "፬": 4, "፭": 5, "፮": 6, "፯": 7, "፰": 8, "፱": 9,
  "፲": 10, "፳": 20, "፴": 30, "፵": 40, "፶": 50, "፷": 60, "፸": 70, "፹": 80, "፺": 90,
  "፻": 100, "፼": 10000,
};

export function normalizeEthiopicNumerals(text) {
  const input = String(text || "");
  return input.replace(/[፩-፼]+/g, (seq) => {
    let total = 0;
    let current = 0;
    for (const ch of seq) {
      const val = ETHIOPIC_VALUES[ch];
      if (!val) continue;
      if (val === 100) {
        current = (current || 1) * 100;
      } else if (val === 10000) {
        total += (current || 1) * 10000;
        current = 0;
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
  const cleaned = String(price || "").replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? Math.round(num) : 0;
}

function getAdTimestamp(ad) {
  const c = ad?.createdAt;
  if (!c) return 0;
  if (typeof c === "number") return c;
  if (typeof c?.toMillis === "function") return c.toMillis();
  if (typeof c === "object" && typeof c.seconds === "number") return c.seconds * 1000;
  if (c instanceof Date) return c.getTime();
  if (typeof c === "string") {
    const parsed = new Date(c).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

const TOKEN_SYNONYM_INDEX = new Map();
for (const group of SYNONYM_GROUPS) {
  for (const term of group) {
    const existing = TOKEN_SYNONYM_INDEX.get(term) || [];
    const merged = Array.from(new Set([...existing, ...group]));
    TOKEN_SYNONYM_INDEX.set(term, merged);
  }
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

export function normalizeCategory(rawCategory, textHint = "") {
  const combined = `${rawCategory || ""} ${textHint || ""}`.toLowerCase();
  const raw = String(rawCategory || "").trim().toLowerCase();

  if (raw === "cars" || raw === "car" || raw === "vehicles") return "Cars";
  if (raw === "houses" || raw === "house") return "Houses";
  if (raw === "rentals" || raw === "rental") return "Rentals";
  if (raw === "electronics") return "Electronics";
  if (raw === "furniture") return "Furniture";
  if (raw === "clothes" || raw === "fashion") return "Clothes";
  if (raw === "building materials") return "Building Materials";
  if (raw === "spare parts") return "Spare Parts";
  if (raw === "labor & services" || raw === "labor and services" || raw === "services") return "Labor & Services";
  if (raw === "ምንአለሽ ተራ" || raw === "ምንአለሽ_ተራ" || raw === "used items") return "ምንአለሽ ተራ";

  if (/(መኪና|toyota|byd|hyundai|suzuki|corolla|vitz|rav4|elantra|sealion|sedan|suv)/.test(combined)) return "Cars";
  if (/(ኪራይ|for rent|to let|rent|lease)/.test(combined)) return "Rentals";
  if (/(ቤት|villa|condominium|condo|real estate|g\+1|g\+2)/.test(combined)) return "Houses";
  if (/(ግራናይት|ማርብል|granite|marble|ceramic|cement|rebar|building material)/.test(combined)) return "Building Materials";
  if (/(መለዋወጫ|spare part|brake pad|headlight|tyre|tire)/.test(combined)) return "Spare Parts";
  if (/(ስልክ|iphone|samsung|laptop|macbook|computer|tv|fridge|electronics)/.test(combined)) return "Electronics";
  if (/(ፈርኒቸር|sofa|mattress|wardrobe|cabinet|furniture|ሶፋ|አልጋ)/.test(combined)) return "Furniture";
  if (/(ልብስ|ጫማ|clothes|shoes|jacket|dress)/.test(combined)) return "Clothes";
  if (/(አገልግሎት|ሠራተኛ|plumber|electrician|mechanic|cleaner|painter)/.test(combined)) return "Labor & Services";
  if (/(ምንአለሽ|second hand|used item)/.test(combined)) return "ምንአለሽ ተራ";

  return String(rawCategory || "Advertisement").trim() || "Advertisement";
}

export function searchMarketplaceAds(ads, options = {}) {
  const {
    query = "",
    category = "",
    subcategory = "",
    condition = "",
    type = "",
    city = "",
    minPrice,
    maxPrice,
    sort = "relevance",
  } = options;

  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const normalizedCategoryFilter = category ? normalizeCategory(category) : "";
  const normalizedSubcatFilter = normalizeSearchText(subcategory);
  const normalizedConditionFilter = normalizeSearchText(condition);
  const normalizedTypeFilter = normalizeSearchText(type);
  const normalizedCityFilter = normalizeSearchText(city);
  const cityVariants = normalizedCityFilter ? expandSearchToken(normalizedCityFilter) : [];

  const scoredResults = [];

  for (const ad of ads || []) {
    if (!ad) continue;

    const resolvedTitle = String(ad.title || "Untitled Advertisement").trim();
    const resolvedCategory = normalizeCategory(ad.category, `${resolvedTitle} ${ad.description || ""}`);
    const resolvedSubcategory = String(ad.subcategory || "").trim();
    const numericPrice = parseNumericPrice(ad.price);

    const titleLower = normalizeSearchText(resolvedTitle);
    const descLower = normalizeSearchText(ad.description || "");
    const catLower = normalizeSearchText(resolvedCategory);
    const subcatLower = normalizeSearchText(resolvedSubcategory);
    const cityLower = normalizeSearchText(`${ad.city || ""} ${ad.subcity || ""}`);
    const condLower = normalizeSearchText(ad.condition || "");
    const typeLower = normalizeSearchText(ad.type || "");
    const fullText = `${titleLower} ${catLower} ${subcatLower} ${cityLower} ${condLower} ${typeLower} ${descLower}`;
    const fullCompact = compactAlnum(fullText);

    if (
      normalizedCategoryFilter &&
      resolvedCategory.toLowerCase() !== normalizedCategoryFilter.toLowerCase()
    ) {
      continue;
    }
    if (
      normalizedSubcatFilter &&
      !subcatLower.includes(normalizedSubcatFilter) &&
      !fullText.includes(normalizedSubcatFilter)
    ) {
      continue;
    }
    if (normalizedConditionFilter && !condLower.includes(normalizedConditionFilter)) {
      continue;
    }
    if (
      normalizedTypeFilter &&
      !typeLower.includes(normalizedTypeFilter) &&
      !fullText.includes(normalizedTypeFilter)
    ) {
      continue;
    }
    if (
      normalizedCityFilter &&
      !cityVariants.some((variant) => cityLower.includes(variant) || fullText.includes(variant))
    ) {
      continue;
    }
    if (typeof minPrice === "number" && Number.isFinite(minPrice) && minPrice > 0 && numericPrice < minPrice) {
      continue;
    }
    if (typeof maxPrice === "number" && Number.isFinite(maxPrice) && maxPrice > 0 && numericPrice > maxPrice) {
      continue;
    }

    let score = 0;
    const reasons = [];

    if (queryTokens.length > 0) {
      let matchedTokens = 0;

      if (titleLower.includes(normalizedQuery)) {
        score += 55;
        reasons.push("Exact Title Match");
      } else if (
        fullText.includes(normalizedQuery) ||
        fullCompact.includes(compactAlnum(normalizedQuery))
      ) {
        score += 35;
      }

      for (const token of queryTokens) {
        const variants = expandSearchToken(token);
        let tokenScore = 0;

        for (const variant of variants) {
          const weight = variant === token ? 1 : 0.78;
          const compactVariant = variant.replace(/\s+/g, "");

          if (titleLower.includes(variant)) {
            tokenScore = Math.max(tokenScore, Math.round(30 * weight));
          } else if (catLower.includes(variant) || subcatLower.includes(variant)) {
            tokenScore = Math.max(tokenScore, Math.round(22 * weight));
          } else if (cityLower.includes(variant)) {
            tokenScore = Math.max(tokenScore, Math.round(22 * weight));
          } else if (descLower.includes(variant)) {
            tokenScore = Math.max(tokenScore, Math.round(14 * weight));
          } else if (compactVariant.length >= 4 && fullCompact.includes(compactVariant)) {
            tokenScore = Math.max(tokenScore, Math.round(16 * weight));
          }
        }

        if (tokenScore > 0) {
          matchedTokens += 1;
          score += tokenScore;
        }
      }

      if (matchedTokens === 0) {
        continue;
      }

      if (matchedTokens === queryTokens.length && queryTokens.length > 1) {
        score += 22;
      }
    }

    if (ad.featured) score += 3;
    if (ad.status === "sold") score = Math.max(1, score - 12);

    const maxPossible = Math.max(45, queryTokens.length * 30 + 35);
    const matchPercentage =
      score > 0 ? Math.min(99, Math.max(38, Math.round((score / maxPossible) * 100))) : 0;

    scoredResults.push({
      ad,
      resolvedTitle,
      resolvedCategory,
      resolvedSubcategory,
      numericPrice,
      matchScore: score,
      matchPercentage,
      matchReasons: Array.from(new Set(reasons)).slice(0, 3),
    });
  }

  scoredResults.sort((a, b) => {
    if (sort === "price-low") {
      return (a.numericPrice || Number.MAX_SAFE_INTEGER) - (b.numericPrice || Number.MAX_SAFE_INTEGER);
    }
    if (sort === "price-high") {
      return b.numericPrice - a.numericPrice;
    }
    if (sort === "newest") {
      return getAdTimestamp(b.ad) - getAdTimestamp(a.ad);
    }
    if (queryTokens.length > 0 && b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    const featDiff = Number(Boolean(b.ad.featured)) - Number(Boolean(a.ad.featured));
    if (featDiff !== 0) return featDiff;
    return getAdTimestamp(b.ad) - getAdTimestamp(a.ad);
  });

  return scoredResults;
}

export function getAutocompleteSuggestions(ads, query, maxAds = 6) {
  const cleanQuery = normalizeSearchText(query);
  if (!cleanQuery) {
    return { categories: [], brands: [], locations: [], ads: [] };
  }

  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  const matchedCategories = UNIFIED_CATEGORIES.filter((cat) => {
    const haystack = normalizeSearchText(`${cat.id} ${cat.name} ${cat.amharic}`);
    return tokens.some((token) =>
      expandSearchToken(token).some((variant) => haystack.includes(variant))
    );
  }).slice(0, 3);

  const popularBrandKeywords = [
    { label: "BYD Electric Cars", query: "BYD", category: "Cars" },
    { label: "Toyota Vehicles", query: "Toyota", category: "Cars" },
    { label: "Hyundai Vehicles", query: "Hyundai", category: "Cars" },
    { label: "Suzuki Cars", query: "Suzuki", category: "Cars" },
    { label: "Apple iPhone", query: "iPhone", category: "Electronics" },
    { label: "Samsung Galaxy", query: "Samsung", category: "Electronics" },
    { label: "Granite & Marble", query: "Granite", category: "Building Materials" },
    { label: "Villas & Condos", query: "Villa", category: "Houses" },
  ];

  const matchedBrands = popularBrandKeywords
    .filter((item) => {
      const target = normalizeSearchText(`${item.label} ${item.query} ${item.category}`);
      return tokens.some((token) =>
        expandSearchToken(token).some((variant) => target.includes(variant))
      );
    })
    .slice(0, 3);

  const locationSuggestions = [
    { label: "Addis Ababa (አዲስ አበባ)", query: "Addis Ababa" },
    { label: "Bole • Summit • CMC (ቦሌ)", query: "Bole" },
    { label: "Adama / Nazret (አዳማ)", query: "Adama" },
    { label: "Hawassa (ሀዋሳ)", query: "Hawassa" },
    { label: "Bahir Dar (ባህር ዳር)", query: "Bahir Dar" },
    { label: "Dire Dawa (ድሬዳዋ)", query: "Dire Dawa" },
    { label: "Mekelle (መቐለ)", query: "Mekelle" },
  ];

  const matchedLocations = locationSuggestions
    .filter((loc) => {
      const target = normalizeSearchText(`${loc.label} ${loc.query}`);
      return tokens.some((token) =>
        expandSearchToken(token).some((variant) => target.includes(variant))
      );
    })
    .slice(0, 2);

  const rankedAds = searchMarketplaceAds(ads || [], { query, sort: "relevance" }).slice(0, maxAds);

  return {
    categories: matchedCategories,
    brands: matchedBrands,
    locations: matchedLocations,
    ads: rankedAds,
  };
}
