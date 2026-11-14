// src/api-worker.js — Cloudflare Worker Backend for AI Exact Image Search + React SPA

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function normalizeText(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[_/\\|,+&•·.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreAdAgainstVisual(ad, analysis) {
  const title = normalizeText(ad.title);
  const desc = normalizeText(ad.description);
  const cat = normalizeText(ad.category);
  const subcat = normalizeText(ad.subcategory);
  const full = `${title} ${cat} ${subcat} ${desc}`;

  let score = 0;
  const reasons = [];

  const brand = normalizeText(analysis.brand);
  const model = normalizeText(analysis.model);
  const year = normalizeText(analysis.year);
  const color = normalizeText(analysis.color);
  const vCat = normalizeText(analysis.category);

  if (brand && (title.includes(brand) || desc.includes(brand))) {
    score += 42;
    reasons.push(`Exact Make: ${analysis.brand}`);
  }
  if (model && (title.includes(model) || desc.includes(model))) {
    score += 50;
    reasons.push(`Exact Model: ${analysis.model}`);
  }
  if (year && (title.includes(year) || desc.includes(year))) {
    score += 18;
    reasons.push(`Year: ${analysis.year}`);
  }
  if (vCat && cat === vCat) {
    score += 18;
    reasons.push(`Category: ${ad.category}`);
  }
  if (color && full.includes(color)) {
    score += 12;
    reasons.push(`Color: ${analysis.color}`);
  }

  for (const kw of [...(analysis.keywords || []), ...(analysis.visualMarkers || [])]) {
    const k = normalizeText(kw);
    if (k.length >= 2 && full.includes(k)) score += 8;
  }

  return { score, reasons };
}

async function fetchImageAsBase64(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = (res.headers.get("content-type") || "image/jpeg").split(";")[0];
    if (!contentType.startsWith("image/")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 2.5 * 1024 * 1024) return null;

    let binary = "";
    const bytes = new Uint8Array(buf);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return { mimeType: contentType, data: btoa(binary) };
  } catch {
    return null;
  }
}

async function callGemini(apiKey, parts) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || "Gemini API request failed");
  }
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return JSON.parse(text);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }

    // AI EXACT IMAGE SEARCH ENDPOINT
    if (url.pathname === "/api/image-search" && request.method === "POST") {
      try {
        if (!env.GEMINI_API_KEY) {
          return new Response(
            JSON.stringify({ error: "GEMINI_API_KEY secret is not set in Cloudflare." }),
            { status: 503, headers: JSON_HEADERS }
          );
        }

        const body = await request.json();
        const { imageBase64, mimeType = "image/jpeg", ads = [] } = body || {};
        if (!imageBase64) {
          return new Response(
            JSON.stringify({ error: "Please select an image to search." }),
            { status: 400, headers: JSON_HEADERS }
          );
        }

        const cleanBase64 = String(imageBase64).replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
        const cleanMime = String(mimeType).split(";")[0] || "image/jpeg";

        // STAGE 1: Identify exact item from uploaded photo
        const stage1Prompt = `You are an exact visual product identifier for Yegna Gebeya (an Ethiopia marketplace).
Identify the item in the image and return valid JSON with these exact keys:
{
  "brand": "",
  "model": "",
  "year": "",
  "trim": "",
  "bodyType": "",
  "color": "",
  "category": "one of: Cars, Houses, Rentals, Electronics, Furniture, Clothes, Building Materials, Spare Parts, Labor & Services, ምንአለሽ_ተራ",
  "subcategory": "",
  "exactQuery": "2-5 word search query",
  "visualMarkers": ["3-5 visual details"],
  "keywords": ["English and Amharic keywords"],
  "confidence": "high | medium | low",
  "summary": "1 sentence description"
}`;

        const analysis = await callGemini(env.GEMINI_API_KEY, [
          { inlineData: { mimeType: cleanMime, data: cleanBase64 } },
          { text: stage1Prompt },
        ]);

        // Pre-rank client Firestore ads
        const preScored = (Array.isArray(ads) ? ads : [])
          .map((ad) => {
            const { score, reasons } = scoreAdAgainstVisual(ad, analysis);
            return { ad, score, reasons };
          })
          .filter((x) => x.score >= 16)
          .sort((a, b) => b.score - a.score);

        // STAGE 2: Side-by-side photo verification on top 4 candidates
        const verifiedCandidates = {};
        const topWithImages = preScored
          .filter((x) => (Array.isArray(x.ad.images) && x.ad.images[0]) || x.ad.image)
          .slice(0, 4);

        if (topWithImages.length > 0) {
          const loaded = await Promise.all(
            topWithImages.map(async (item) => {
              const imgUrl = Array.isArray(item.ad.images) ? item.ad.images[0] : item.ad.image;
              const imgData = await fetchImageAsBase64(imgUrl);
              return imgData ? { item, imgData } : null;
            })
          );
          const valid = loaded.filter(Boolean);

          if (valid.length > 0) {
            const compareParts = [
              {
                text: `Compare the FIRST uploaded query image against each candidate listing photo.
Return JSON: { "comparisons": [{ "adId": "...", "exactSameItem": true/false, "similarityScore": 0-100, "visualMatchReasons": ["..."] }] }`,
              },
              { text: "QUERY IMAGE:" },
              { inlineData: { mimeType: cleanMime, data: cleanBase64 } },
            ];
            for (const c of valid) {
              compareParts.push({ text: `CANDIDATE ID="${c.item.ad.id}" | Title="${c.item.ad.title || ""}"` });
              compareParts.push({ inlineData: c.imgData });
            }

            try {
              const stage2 = await callGemini(env.GEMINI_API_KEY, compareParts);
              for (const comp of stage2.comparisons || []) {
                if (comp?.adId) {
                  verifiedCandidates[comp.adId] = {
                    adId: comp.adId,
                    exactSameItem: Boolean(comp.exactSameItem),
                    similarityScore: Number(comp.similarityScore) || 0,
                    visualMatchReasons: Array.isArray(comp.visualMatchReasons)
                      ? comp.visualMatchReasons.slice(0, 3)
                      : [],
                  };
                }
              }
              analysis.verifiedCandidates = verifiedCandidates;
              analysis.visualVerifiedCount = Object.keys(verifiedCandidates).length;
            } catch {
              // Keep Stage 1 matches if Stage 2 comparison times out
            }
          }
        }

        const matches = preScored.map((item) => {
          const v = verifiedCandidates[item.ad.id];
          const pct = v ? v.similarityScore : Math.min(99, Math.max(40, Math.round((item.score / 130) * 100)));
          const reasons = v?.visualMatchReasons?.length ? [...v.visualMatchReasons, ...item.reasons] : item.reasons;
          return {
            ad: item.ad,
            resolvedTitle: item.ad.title || analysis.exactQuery,
            resolvedCategory: item.ad.category || analysis.category,
            resolvedSubcategory: item.ad.subcategory || analysis.subcategory || "",
            numericPrice: Number(String(item.ad.price || 0).replace(/[^0-9]/g, "")) || 0,
            matchScore: v ? item.score + v.similarityScore : item.score,
            matchPercentage: pct,
            matchReasons: Array.from(new Set(reasons)).slice(0, 3),
            exactVisualMatch: Boolean(v?.exactSameItem || pct >= 85),
          };
        });

        matches.sort((a, b) => b.matchScore - a.matchScore);

        return new Response(
          JSON.stringify({
            success: true,
            analysis,
            exactQuery: analysis.exactQuery || [analysis.year, analysis.brand, analysis.model].filter(Boolean).join(" "),
            matches,
          }),
          { status: 200, headers: JSON_HEADERS }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message || "AI image search failed" }),
          { status: 500, headers: JSON_HEADERS }
        );
      }
    }

    // Serve static Vite SPA assets for all other routes
    return env.ASSETS.fetch(request);
  },
};
