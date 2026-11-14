import {
  UNIFIED_CATEGORIES,
  classifyMarketplaceAd,
  detectBrandModelYear,
  normalizeCategory,
  normalizeEthiopicNumerals,
} from './categoryClassifier';

export interface SearchableAd {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: number | string;
  city?: string;
  subcity?: string;
  condition?: string;
  type?: string;
  materialType?: string;
  images?: string[];
  image?: string;
  featured?: boolean;
  status?: string;
  createdAt?: any;
  views?: number;
  sellerName?: string;
  phone?: string;
  source?: string;
  [key: string]: any;
}

export interface VisualCandidateVerification {
  adId: string;
  exactSameItem?: boolean;
  similarityScore: number;
  visualMatchReasons?: string[];
}

export interface VisualSearchAnalysis {
  brand?: string;
  model?: string;
  year?: string;
  trim?: string;
  bodyType?: string;
  color?: string;
  category?: string;
  subcategory?: string;
  exactQuery?: string;
  visualMarkers?: string[];
  keywords?: string[];
  summary?: string;
  confidence?: string;
  visualVerifiedCount?: number;
  verifiedCandidates?: Record<string, VisualCandidateVerification>;
}

export interface SearchOptions {
  query?: string;
  category?: string;
  subcategory?: string;
  condition?: string;
  type?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'relevance' | 'newest' | 'price-low' | 'price-high';
  visualAnalysis?: VisualSearchAnalysis | null;
}

export interface RankedAdResult<T extends SearchableAd = SearchableAd> {
  ad: T;
  resolvedTitle: string;
  resolvedCategory: string;
  resolvedSubcategory: string;
  numericPrice: number;
  matchScore: number;
  matchPercentage: number;
  matchReasons: string[];
  exactVisualMatch?: boolean;
}

export interface AutocompleteResults<T extends SearchableAd = SearchableAd> {
  categories: Array<{
    id: string;
    name: string;
    amharic: string;
    iconKey: string;
    iconColor: string;
    count: number;
  }>;
  brands: Array<{ label: string; query: string; category: string }>;
  locations: Array<{ label: string; query: string }>;
  ads: RankedAdResult<T>[];
}

export const ETHIOPIA_CITIES: Array<{ name: string; amharic: string }> = [
  { name: 'Addis Ababa', amharic: 'አዲስ አበባ' },
  { name: 'Adama', amharic: 'አዳማ / ናዝሬት' },
  { name: 'Hawassa', amharic: 'ሀዋሳ' },
  { name: 'Bahir Dar', amharic: 'ባህር ዳር' },
  { name: 'Dire Dawa', amharic: 'ድሬዳዋ' },
  { name: 'Mekelle', amharic: 'መቐለ' },
  { name: 'Bishoftu', amharic: 'ቢሾፍቱ' },
  { name: 'Gondar', amharic: 'ጎንደር' },
  { name: 'Jimma', amharic: 'ጅማ' },
  { name: 'Dessie', amharic: 'ደሴ' },
  { name: 'Shashemene', amharic: 'ሻሸመኔ' },
  { name: 'Jigjiga', amharic: 'ጅግጅጋ' },
  { name: 'Harar', amharic: 'ሐረር' },
  { name: 'Arba Minch', amharic: 'አርባ ምንጭ' },
  { name: 'Debre Birhan', amharic: 'ደብረ ብርሃን' },
  { name: 'Hosanna', amharic: 'ሆሳዕና' },
  { name: 'Wolaita Sodo', amharic: 'ወላይታ ሶዶ' },
  { name: 'Nekemte', amharic: 'ነቀምቴ' },
];

const SYNONYM_GROUPS: string[][] = [
  ['car', 'cars', 'auto', 'vehicle', 'vehicles', 'sedan', 'suv', 'ev', 'electric', 'hybrid', 'plate', 'code 2', 'code 3', 'መኪና', 'መኪኖች', 'አውቶሞቢል', 'ተሽከርካሪ', 'ኤሌክትሪክ', 'ታርጋ', 'ኮድ 2', 'ኮድ 3', 'ዲውቲ'],
  ['byd', 'ባይድ', 'ቢዋይዲ', 'sealion', 'ሲላየን', 'seagull', 'ሲገል', 'dolphin', 'atto', 'song plus'],
  ['toyota', 'ቶዮታ', 'ቶዬታ', 'corolla', 'ኮሮላ', 'rav4', 'ራቭ4', 'vitz', 'ቪትዝ', 'yaris', 'ያሪስ', 'hilux', 'ሀይሉክስ', 'prado', 'ፕራዶ', 'land cruiser', 'ላንድ ክሩዘር', 'hiace', 'camry'],
  ['hyundai', 'ሂዩንዳይ', 'ሃዩንዳይ', 'ሀዩንዳይ', 'elantra', 'ኤላንትራ', 'tucson', 'ቱክሰን', 'creta', 'santa fe', 'i10', 'staria', 'kona'],
  ['suzuki', 'ሱዙኪ', 'ሱዚኪ', 'swift', 'ስዊፍት', 'dzire', 'ዲዛየር', 'alto', 'አልቶ', 'celerio', 'ertiga', 'vitara'],
  ['volkswagen', 'vw', 'id4', 'id.4', 'id6', 'id.6', 'tiguan', 'ፎልክስዋገን', 'ቮልስዋገን'],
  ['isuzu', 'fsr', 'npr', 'd-max', 'truck', 'pickup', 'bajaj', 'damas', 'ኢሱዙ', 'ጭነት', 'ባጃጅ'],
  ['house', 'houses', 'villa', 'condo', 'condominium', 'apartment', 'home', 'real estate', 'land', 'plot', 'g+1', 'g+2', 'g+3', 'ቤት', 'ቤቶች', 'ቪላ', 'ኮንዶ', 'ኮንዶሚኒየም', 'አፓርታማ', 'ሪል እስቴት', 'መሬት', 'ቦታ', 'ካርታ'],
  ['rent', 'rental', 'rentals', 'lease', 'monthly', 'shop', 'office', 'warehouse', 'ኪራይ', 'የሚከራይ', 'ለኪራይ', 'ሱቅ', 'ቢሮ', 'መጋዘን'],
  ['phone', 'smartphone', 'iphone', 'mobile', 'samsung', 'galaxy', 'pixel', 'xiaomi', 'tecno', 'ስልክ', 'ሞባይል', 'አይፎን', 'ሳምሰንግ'],
  ['laptop', 'computer', 'pc', 'macbook', 'dell', 'hp', 'lenovo', 'ላፕቶፕ', 'ኮምፒውተር', 'ማክቡክ'],
  ['tv', 'television', 'lg', 'sony', 'fridge', 'refrigerator', 'washer', 'washing machine', 'ቴሌቪዥን', 'ቲቪ', 'ፍሪጅ', 'ማጠቢያ'],
  ['electronics', 'gadget', 'camera', 'ps5', 'playstation', 'ኤሌክትሮኒክስ'],
  ['furniture', 'sofa', 'bed', 'mattress', 'table', 'chair', 'cabinet', 'wardrobe', 'buffet', 'ፈርኒቸር', 'ሶፋ', 'አልጋ', 'ፍራሽ', 'ጠረጴዛ', 'ወንበር', 'ቁምሳጥን', 'ቡፌ'],
  ['clothes', 'fashion', 'shoes', 'sneakers', 'leather', 'jacket', 'dress', 'suit', 'ልብስ', 'ጫማ', 'ጃኬት', 'ቀሚስ', 'የቆዳ ጫማ'],
  ['building', 'material', 'materials', 'granite', 'marble', 'ceramic', 'porcelain', 'tile', 'cement', 'rebar', 'steel', 'gypsum', 'paint', 'ግንባታ', 'ግራናይት', 'ማርብል', 'ሴራሚክ', 'ሲሚንቶ', 'ብረት', 'ቆርቆሮ', 'ብሎኬት'],
  ['spare', 'parts', 'tire', 'tyre', 'rim', 'battery', 'brake', 'oil', 'filter', 'headlight', 'bumper', 'መለዋወጫ', 'ስፔር', 'ጎማ', 'ባትሪ', 'ፍሬን', 'ፋሮ', 'ዘይት'],
  ['service', 'services', 'labor', 'plumber', 'electrician', 'driver', 'painter', 'mechanic', 'cleaner', 'tutor', 'አገልግሎት', 'ሠራተኛ', 'ቧንቧ', 'ሹፌር', 'መካኒክ', 'ጥገና', 'ጽዳት'],
  ['addis ababa', 'addis', 'አዲስ አበባ', 'finfinne'],
  ['bole', 'bole bulbula', 'bole medhanialem', 'bole atlas', 'ቦሌ', 'ቦሌ ቡልቡላ', 'ቦሌ መድሃኒያለም'],
  ['summit', 'cmc', 'ayat', 'tafo', 'yeka', 'lemi kura', 'ሰሚት', 'ሲኤምሲ', 'አያት', 'ጣፎ', 'የካ'],
  ['kazanchis', 'megenagna', 'gerji', 'hayahulet', '22', 'piassa', 'arada', 'merkato', 'ካዛንቺስ', 'መገናኛ', 'ገርጂ', 'ፒያሳ', 'መርካቶ'],
  ['sarbet', 'lebu', 'jemo', 'saris', 'kality', 'kera', 'ሳርቤት', 'ለቡ', 'ጀሞ', 'ሳሪስ', 'ቃሊቲ', 'ቄራ'],
  ['adama', 'nazret', 'አዳማ', 'ናዝሬት'],
  ['hawassa', 'awassa', 'ሀዋሳ', 'አዋሳ'],
  ['bahir dar', 'ባህር ዳር'],
  ['dire dawa', 'ድሬዳዋ'],
  ['mekelle', 'መቐለ', 'መቀሌ'],
  ['bishoftu', 'debre zeit', 'ቢሾፍቱ'],
  ['gondar', 'ጎንደር'],
  ['jimma', 'ጅማ'],
  ['dessie', 'kombolcha', 'ደሴ', 'ኮምቦልቻ'],
];

const TOKEN_SYNONYM_INDEX = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) {
  for (const term of group) {
    const existing = TOKEN_SYNONYM_INDEX.get(term) || [];
    const merged = Array.from(new Set([...existing, ...group]));
    TOKEN_SYNONYM_INDEX.set(term, merged);
  }
}

export function normalizeSearchText(raw: string): string {
  return normalizeEthiopicNumerals(String(raw || ''))
    .toLowerCase()
    .replace(/[_/\\|,+&•·.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactAlnum(raw: string): string {
  return normalizeSearchText(raw).replace(/\s+/g, '');
}

export function parseNumericPrice(price: number | string | undefined): number {
  if (typeof price === 'number' && Number.isFinite(price)) return price;
  const cleaned = String(price || '').replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? Math.round(num) : 0;
}

function getAdTimestamp(ad: SearchableAd): number {
  const c = ad?.createdAt;
  if (!c) return 0;
  if (typeof c === 'number') return c;
  if (typeof c?.toMillis === 'function') return c.toMillis();
  if (typeof c === 'object' && typeof c.seconds === 'number') return c.seconds * 1000;
  if (c instanceof Date) return c.getTime();
  if (typeof c === 'string') {
    const lower = c.toLowerCase();
    const now = Date.now();
    if (lower.includes('just now')) return now;
    const minMatch = lower.match(/(\d+)\s*min/);
    if (minMatch) return now - parseInt(minMatch[1], 10) * 60_000;
    const hourMatch = lower.match(/(\d+)\s*hour/);
    if (hourMatch) return now - parseInt(hourMatch[1], 10) * 3_600_000;
    const dayMatch = lower.match(/(\d+)\s*day/);
    if (dayMatch) return now - parseInt(dayMatch[1], 10) * 86_400_000;
    const parsed = new Date(c).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function expandSearchToken(token: string): string[] {
  const clean = normalizeSearchText(token);
  if (!clean) return [];
  const results = new Set<string>([clean]);

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

export function mergeAndDedupeAds<T extends SearchableAd>(...lists: T[][]): T[] {
  const seen = new Map<string, T>();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const ad of list) {
      if (!ad || !ad.id) continue;
      if (!seen.has(ad.id)) {
        seen.set(ad.id, ad);
      } else {
        const existing = seen.get(ad.id)!;
        const existingImgs = Array.isArray(existing.images) ? existing.images.length : existing.image ? 1 : 0;
        const nextImgs = Array.isArray(ad.images) ? ad.images.length : ad.image ? 1 : 0;
        if (nextImgs > existingImgs) {
          seen.set(ad.id, { ...existing, ...ad });
        }
      }
    }
  }
  return Array.from(seen.values());
}

export function enrichAd<T extends SearchableAd>(ad: T) {
  const classified = classifyMarketplaceAd({
    title: ad.title,
    description: ad.description,
    category: ad.category,
    subcategory: ad.subcategory,
  });

  const resolvedCategory = normalizeCategory(
    ad.category,
    `${ad.title || ''} ${ad.description || ''}`
  );

  const resolvedTitle =
    ad.title &&
    ad.title.trim().length > 2 &&
    !/^(?:urgent|sale|አስቸኳይ|ሽያጭ)$/i.test(ad.title.trim())
      ? ad.title.trim()
      : classified.exactTitle;

  const resolvedSubcategory = ad.subcategory || classified.subcategory || '';
  const numericPrice = parseNumericPrice(ad.price) || classified.rawPrice || 0;
  const meta = detectBrandModelYear(`${resolvedTitle} ${ad.description || ''}`);

  return {
    resolvedTitle,
    resolvedCategory,
    resolvedSubcategory,
    numericPrice,
    brand: meta.brand,
    model: meta.model,
    year: meta.year,
    city: ad.city || classified.city || '',
    subcity: ad.subcity || classified.subcity || '',
  };
}

export function searchMarketplaceAds<T extends SearchableAd>(
  ads: T[],
  options: SearchOptions = {}
): RankedAdResult<T>[] {
  const {
    query = '',
    category = '',
    subcategory = '',
    condition = '',
    type = '',
    city = '',
    minPrice,
    maxPrice,
    sort = 'relevance',
    visualAnalysis = null,
  } = options;

  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 0);
  const normalizedCategoryFilter = category ? normalizeCategory(category) : '';
  const normalizedSubcatFilter = normalizeSearchText(subcategory);
  const normalizedConditionFilter = normalizeSearchText(condition);
  const normalizedTypeFilter = normalizeSearchText(type);
  const normalizedCityFilter = normalizeSearchText(city);
  const cityVariants = normalizedCityFilter ? expandSearchToken(normalizedCityFilter) : [];

  const vBrand = normalizeSearchText(visualAnalysis?.brand || '');
  const vModel = normalizeSearchText(visualAnalysis?.model || '');
  const vYear = normalizeSearchText(visualAnalysis?.year || '');
  const vColor = normalizeSearchText(visualAnalysis?.color || '');
  const vBody = normalizeSearchText(visualAnalysis?.bodyType || '');
  const vCat = visualAnalysis?.category ? normalizeCategory(visualAnalysis.category) : '';
  const vSubcat = normalizeSearchText(visualAnalysis?.subcategory || '');
  const vKeywords = Array.from(
    new Set([
      ...(visualAnalysis?.keywords || []),
      ...(visualAnalysis?.visualMarkers || []),
    ])
  )
    .map((k) => normalizeSearchText(k))
    .filter((k) => k.length >= 2);
  const verifiedMap = visualAnalysis?.verifiedCandidates || {};
  const hasVisualQuery = Boolean(
    visualAnalysis && (vBrand || vModel || vCat || vKeywords.length > 0 || visualAnalysis.exactQuery)
  );

  const scoredResults: RankedAdResult<T>[] = [];

  for (const ad of ads) {
    const info = enrichAd(ad);
    const titleLower = normalizeSearchText(info.resolvedTitle);
    const descLower = normalizeSearchText(ad.description || '');
    const catLower = normalizeSearchText(info.resolvedCategory);
    const subcatLower = normalizeSearchText(info.resolvedSubcategory);
    const cityLower = normalizeSearchText(`${info.city} ${info.subcity}`);
    const condLower = normalizeSearchText(ad.condition || '');
    const typeLower = normalizeSearchText(ad.type || '');
    const brandLower = normalizeSearchText(info.brand);
    const modelLower = normalizeSearchText(info.model);
    const fullText = `${titleLower} ${brandLower} ${modelLower} ${catLower} ${subcatLower} ${cityLower} ${condLower} ${descLower}`;
    const fullCompact = compactAlnum(fullText);

    if (category && info.resolvedCategory.toLowerCase() !== normalizedCategoryFilter.toLowerCase()) {
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
    if (typeof minPrice === 'number' && Number.isFinite(minPrice) && minPrice > 0 && info.numericPrice < minPrice) {
      continue;
    }
    if (typeof maxPrice === 'number' && Number.isFinite(maxPrice) && maxPrice > 0 && info.numericPrice > maxPrice) {
      continue;
    }

    let score = 0;
    const reasons: string[] = [];

    if (queryTokens.length > 0) {
      let matchedTokens = 0;

      if (titleLower.includes(normalizedQuery)) {
        score += 55;
        reasons.push('Exact Title Match');
      } else if (fullText.includes(normalizedQuery) || fullCompact.includes(compactAlnum(normalizedQuery))) {
        score += 35;
      }

      for (const token of queryTokens) {
        const variants = expandSearchToken(token);
        let tokenScore = 0;

        for (const variant of variants) {
          const isOriginal = variant === token;
          const weightMultiplier = isOriginal ? 1 : 0.78;
          const compactVariant = variant.replace(/\s+/g, '');

          if (titleLower.includes(variant)) {
            tokenScore = Math.max(tokenScore, Math.round(30 * weightMultiplier));
          } else if (brandLower && brandLower.includes(variant)) {
            tokenScore = Math.max(tokenScore, Math.round(26 * weightMultiplier));
          } else if (modelLower && modelLower.includes(variant)) {
            tokenScore = Math.max(tokenScore, Math.round(28 * weightMultiplier));
          } else if (catLower.includes(variant) || subcatLower.includes(variant)) {
            tokenScore = Math.max(tokenScore, Math.round(20 * weightMultiplier));
          } else if (cityLower.includes(variant)) {
            tokenScore = Math.max(tokenScore, Math.round(22 * weightMultiplier));
          } else if (descLower.includes(variant)) {
            tokenScore = Math.max(tokenScore, Math.round(13 * weightMultiplier));
          } else if (compactVariant.length >= 4 && fullCompact.includes(compactVariant)) {
            tokenScore = Math.max(tokenScore, Math.round(16 * weightMultiplier));
          }
        }

        if (tokenScore > 0) {
          matchedTokens += 1;
          score += tokenScore;
        }
      }

      if (matchedTokens === 0 && !hasVisualQuery) {
        continue;
      }

      if (matchedTokens === queryTokens.length && queryTokens.length > 1) {
        score += 22;
      }
    }

    let exactVisualMatch = false;
    let verifiedScoreOverride: number | null = null;

    if (hasVisualQuery) {
      let visualScore = 0;

      if (vBrand && (titleLower.includes(vBrand) || brandLower.includes(vBrand) || descLower.includes(vBrand))) {
        visualScore += 42;
        reasons.push(`Exact Make: ${visualAnalysis?.brand}`);
      }

      if (vModel) {
        const vModelCompact = vModel.replace(/\s+/g, '');
        const modelParts = vModel.split(/\s+/).filter((p) => p.length >= 2);
        if (
          titleLower.includes(vModel) ||
          modelLower.includes(vModel) ||
          descLower.includes(vModel) ||
          (vModelCompact.length >= 4 && fullCompact.includes(vModelCompact))
        ) {
          visualScore += 50;
          reasons.push(`Exact Model: ${visualAnalysis?.model}`);
        } else if (modelParts.length > 1 && modelParts.some((p) => fullText.includes(p))) {
          visualScore += 24;
          reasons.push(`Similar Model: ${visualAnalysis?.model}`);
        }
      }

      if (vYear && (titleLower.includes(vYear) || info.year === vYear || descLower.includes(vYear))) {
        visualScore += 18;
        reasons.push(`Year: ${visualAnalysis?.year}`);
      }

      if (vCat && info.resolvedCategory.toLowerCase() === vCat.toLowerCase()) {
        visualScore += 18;
        reasons.push(`Category: ${info.resolvedCategory}`);
      }

      if (vSubcat && (subcatLower.includes(vSubcat) || vSubcat.includes(subcatLower))) {
        visualScore += 14;
      }

      if (vBody && (subcatLower.includes(vBody) || fullText.includes(vBody))) {
        visualScore += 10;
      }

      if (vColor && fullText.includes(vColor)) {
        visualScore += 12;
        reasons.push(`Color: ${visualAnalysis?.color}`);
      }

      let keywordHits = 0;
      for (const kw of vKeywords) {
        const variants = expandSearchToken(kw);
        if (variants.some((v) => fullText.includes(v))) {
          keywordHits += 1;
        }
      }
      if (keywordHits > 0) {
        visualScore += Math.min(30, keywordHits * 8);
      }

      const verified = verifiedMap[ad.id];
      if (verified && typeof verified.similarityScore === 'number') {
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
            if (vr && !reasons.includes(vr)) {
              reasons.unshift(vr);
            }
          }
        }
      }

      if (visualScore < 18 && queryTokens.length === 0 && !verified) {
        continue;
      }

      score += visualScore;
    }

    if (ad.featured) score += 3;
    if (ad.status === 'sold') score = Math.max(1, score - 12);

    const maxPossible = hasVisualQuery ? 140 : Math.max(45, queryTokens.length * 30 + 35);
    const computedPercentage =
      score > 0 ? Math.min(99, Math.max(38, Math.round((score / maxPossible) * 100))) : 0;
    const matchPercentage =
      verifiedScoreOverride !== null ? verifiedScoreOverride : computedPercentage;

    scoredResults.push({
      ad,
      resolvedTitle: info.resolvedTitle,
      resolvedCategory: info.resolvedCategory,
      resolvedSubcategory: info.resolvedSubcategory,
      numericPrice: info.numericPrice,
      matchScore: score,
      matchPercentage,
      matchReasons: Array.from(new Set(reasons)).slice(0, 3),
      exactVisualMatch,
    });
  }

  scoredResults.sort((a, b) => {
    if (sort === 'price-low') {
      return (a.numericPrice || Number.MAX_SAFE_INTEGER) - (b.numericPrice || Number.MAX_SAFE_INTEGER);
    }
    if (sort === 'price-high') {
      return b.numericPrice - a.numericPrice;
    }
    if (sort === 'newest') {
      return getAdTimestamp(b.ad) - getAdTimestamp(a.ad);
    }
    if (queryTokens.length > 0 || hasVisualQuery) {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    }
    const featDiff = Number(Boolean(b.ad.featured)) - Number(Boolean(a.ad.featured));
    if (featDiff !== 0) return featDiff;
    return getAdTimestamp(b.ad) - getAdTimestamp(a.ad);
  });

  return scoredResults;
}

export function getAutocompleteSuggestions<T extends SearchableAd>(
  ads: T[],
  query: string,
  maxAds: number = 6
): AutocompleteResults<T> {
  const cleanQuery = normalizeSearchText(query);
  if (!cleanQuery) {
    return { categories: [], brands: [], locations: [], ads: [] };
  }

  const tokens = cleanQuery.split(/\s+/).filter(Boolean);
  const categoryCounts = new Map<string, number>();
  for (const ad of ads) {
    const cat = normalizeCategory(ad.category, `${ad.title || ''} ${ad.description || ''}`);
    categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
  }

  const matchedCategories = UNIFIED_CATEGORIES.filter((cat) => {
    const haystack = normalizeSearchText(`${cat.id} ${cat.name} ${cat.amharic} ${cat.defaultSubcategory}`);
    return tokens.some((token) =>
      expandSearchToken(token).some((variant) => haystack.includes(variant))
    );
  })
    .slice(0, 3)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      amharic: cat.amharic,
      iconKey: cat.iconKey,
      iconColor: cat.iconColor,
      count: categoryCounts.get(cat.id) || 0,
    }));

  const popularBrandKeywords = [
    { label: 'BYD Electric Cars', query: 'BYD', category: 'Cars' },
    { label: 'Toyota Vehicles', query: 'Toyota', category: 'Cars' },
    { label: 'Hyundai Vehicles', query: 'Hyundai', category: 'Cars' },
    { label: 'Suzuki Cars', query: 'Suzuki', category: 'Cars' },
    { label: 'Apple iPhone', query: 'iPhone', category: 'Electronics' },
    { label: 'Samsung Galaxy', query: 'Samsung', category: 'Electronics' },
    { label: 'Granite & Marble', query: 'Granite', category: 'Building Materials' },
    { label: 'Luxury Villas & Condos', query: 'Villa', category: 'Houses' },
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
    { label: 'Addis Ababa (አዲስ አበባ)', query: 'Addis Ababa' },
    { label: 'Bole • Summit • CMC (ቦሌ)', query: 'Bole' },
    { label: 'Adama / Nazret (አዳማ)', query: 'Adama' },
    { label: 'Hawassa (ሀዋሳ)', query: 'Hawassa' },
    { label: 'Bahir Dar (ባህር ዳር)', query: 'Bahir Dar' },
    { label: 'Dire Dawa (ድሬዳዋ)', query: 'Dire Dawa' },
    { label: 'Mekelle (መቐለ)', query: 'Mekelle' },
  ];

  const matchedLocations = locationSuggestions
    .filter((loc) => {
      const target = normalizeSearchText(`${loc.label} ${loc.query}`);
      return tokens.some((token) =>
        expandSearchToken(token).some((variant) => target.includes(variant))
      );
    })
    .slice(0, 2);

  const rankedAds = searchMarketplaceAds(ads, { query, sort: 'relevance' }).slice(0, maxAds);

  return {
    categories: matchedCategories,
    brands: matchedBrands,
    locations: matchedLocations,
    ads: rankedAds,
  };
}
