// FILE: src/api-worker.js
import {
  normalizeCategory,
  searchMarketplaceAds,
} from "./utils/localSearchEngine.js";

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function fetchImageAsInlinePart(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  try {
    if (imageUrl.startsWith("data:image/")) {
      const m = imageUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (m) return { inline_data: { mime_type: m[1], data: m[2] } };
      return null;
    }
    if (!imageUrl.startsWith("http")) return null;
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const contentType = (res.headers.get("content-type") || "image/jpeg").split(";")[0];
    if (!contentType.startsWith("image/")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > 3_500_000) return null;
    return {
      inline_data: {
        mime_type: contentType,
        data: arrayBufferToBase64(buf),
      },
    };
  } catch {
    return null;
  }
}

async function callGeminiVision(apiKey, model, parts, responseSchema) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return JSON.parse(rawText);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return jsonResponse({ ok: true }, 200);
    }

    if (url.pathname === "/api/image-search" && request.method === "POST") {
      try {
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
          return jsonResponse(
            { error: "GEMINI_API_KEY በ Cloudflare secret ውስጥ አልተጨመረም።" },
            503
          );
        }

        const model = env.GEMINI_MODEL || "gemini-2.5-flash";
        const body = await request.json();
        const { imageBase64, mimeType = "image/jpeg", ads: clientAds = [] } = body || {};

        if (!imageBase64) {
          return jsonResponse({ error: "Missing imageBase64" }, 400);
        }

        const cleanBase64 = String(imageBase64).replace(
          /^data:image\/[a-zA-Z0-9+.-]+;base64,/,
          ""
        );
        const cleanMime = String(mimeType).split(";")[0] || "image/jpeg";

        // ደረጃ 1: በፎቶው ላይ ያለውን እቃ በትክክል መለየት
        const stage1Schema = {
          type: "OBJECT",
          properties: {
            brand: { type: "STRING" },
            model: { type: "STRING" },
            year: { type: "STRING" },
            trim: { type: "STRING" },
            bodyType: { type: "STRING" },
            color: { type: "STRING" },
            category: { type: "STRING" },
            subcategory: { type: "STRING" },
            exactQuery: { type: "STRING" },
            visualMarkers: { type: "ARRAY", items: { type: "STRING" } },
            keywords: { type: "ARRAY", items: { type: "STRING" } },
            confidence: { type: "STRING" },
            summary: { type: "STRING" },
          },
        };

        const stage1Prompt = `You are an expert visual product & vehicle identifier for an Ethiopian marketplace (Yegna Gebeya).
Analyze the uploaded photo carefully and extract exact identifying attributes:
- brand (e.g., BYD, Toyota, Hyundai, Suzuki, Apple, Samsung, Ferrari, etc.)
- model (e.g., Sealion 06 EV, Corolla, RAV4, Dzire, iPhone 16 Pro Max, L-Shape Sofa)
- year (estimated year or generation)
- trim / edition
- bodyType (e.g., Sedan, SUV, Electric EV, Smartphone, Sofa, Granite)
- color (exact exterior or material color)
- category (MUST be one of: Cars, Houses, Rentals, Electronics, Furniture, Clothes, Building Materials, Spare Parts, Labor & Services)
- subcategory
- exactQuery (2 to 5 word concise search query for matching this exact item)
- visualMarkers (3 to 5 visible features)
- keywords (6 to 10 English + Amharic marketplace search keywords)
- confidence (high, medium, low)
- summary (1 clear sentence describing the exact item)`;

        const parsed = await callGeminiVision(
          apiKey,
          model,
          [
            { inline_data: { mime_type: cleanMime, data: cleanBase64 } },
            { text: stage1Prompt },
          ],
          stage1Schema
        );

        const normalizedCat = normalizeCategory(
          parsed.category,
          `${parsed.exactQuery || ""} ${parsed.brand || ""} ${parsed.model || ""} ${(parsed.keywords || []).join(" ")}`
        );

        const analysis = {
          ...parsed,
          category: normalizedCat,
          exactQuery:
            (parsed.exactQuery || "").trim() ||
            [parsed.year, parsed.brand, parsed.model].filter(Boolean).join(" ") ||
            normalizedCat,
        };

        const validAds = Array.isArray(clientAds) ? clientAds : [];

        let preRanked = searchMarketplaceAds(validAds, {
          visualAnalysis: analysis,
          sort: "relevance",
        });

        if (preRanked.length === 0 && analysis.category) {
          preRanked = searchMarketplaceAds(validAds, {
            category: analysis.category,
            sort: "relevance",
          });
        }

        // ደረጃ 2: ከገበያው ማስታወቂያ ፎቶዎች ጋር ጎን ለጎን (Side-by-Side) ማነጻጸር
        const candidatesWithPhotos = preRanked
          .filter((r) => {
            const img =
              Array.isArray(r.ad.images) && r.ad.images.length > 0
                ? r.ad.images[0]
                : r.ad.image;
            return Boolean(img);
          })
          .slice(0, 5);

        if (candidatesWithPhotos.length > 0) {
          try {
            const resolved = await Promise.all(
              candidatesWithPhotos.map(async (item) => {
                const imgUrl =
                  Array.isArray(item.ad.images) && item.ad.images.length > 0
                    ? item.ad.images[0]
                    : item.ad.image;
                const part = await fetchImageAsInlinePart(imgUrl);
                return part ? { item, part } : null;
              })
            );

            const validCandidates = resolved.filter(Boolean);
            if (validCandidates.length > 0) {
              const compareParts = [
                {
                  text: `Compare the FIRST uploaded query image against each candidate marketplace listing photo below.
Judge visual similarity accurately (same exact model, generation, grille/headlights, silhouette, color, or product design).
Be strict: only mark exactSameItem=true if it is clearly the same exact product/model/item.
Return a JSON object with a "comparisons" array containing one entry per candidate ID.`,
                },
                { text: "QUERY IMAGE (User uploaded photo):" },
                { inline_data: { mime_type: cleanMime, data: cleanBase64 } },
              ];

              for (const c of validCandidates) {
                compareParts.push({
                  text: `CANDIDATE ID="${c.item.ad.id}" | Title="${c.item.resolvedTitle}" | Category="${c.item.resolvedCategory}"`,
                });
                compareParts.push(c.part);
              }

              const stage2Schema = {
                type: "OBJECT",
                properties: {
                  comparisons: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        adId: { type: "STRING" },
                        exactSameItem: { type: "BOOLEAN" },
                        similarityScore: { type: "INTEGER" },
                        visualMatchReasons: {
                          type: "ARRAY",
                          items: { type: "STRING" },
                        },
                      },
                    },
                  },
                },
              };

              const stage2Json = await callGeminiVision(
                apiKey,
                model,
                compareParts,
                stage2Schema
              );

              if (Array.isArray(stage2Json.comparisons)) {
                const verifiedMap = {};
                for (const comp of stage2Json.comparisons) {
                  if (comp && comp.adId) {
                    verifiedMap[comp.adId] = {
                      adId: comp.adId,
                      exactSameItem: Boolean(comp.exactSameItem),
                      similarityScore: Number(comp.similarityScore) || 0,
                      visualMatchReasons: Array.isArray(comp.visualMatchReasons)
                        ? comp.visualMatchReasons.slice(0, 3)
                        : [],
                    };
                  }
                }
                analysis.verifiedCandidates = verifiedMap;
                analysis.visualVerifiedCount = Object.keys(verifiedMap).length;
              }
            }
          } catch (stage2Err) {
            console.warn("Stage 2 visual comparison skipped:", stage2Err);
          }
        }

        let matches = searchMarketplaceAds(validAds, {
          visualAnalysis: analysis,
          sort: "relevance",
        });

        if (matches.length === 0 && analysis.category) {
          matches = searchMarketplaceAds(validAds, {
            category: analysis.category,
            sort: "relevance",
          }).slice(0, 8);
        }

        return jsonResponse({
          success: true,
          analysis,
          exactQuery: analysis.exactQuery,
          matches,
        });
      } catch (err) {
        return jsonResponse(
          { error: err?.message || "AI image search failed." },
          500
        );
      }
    }

    // ሌሎች Request-ቶች በሙሉ ወደ React SPA ይላካሉ
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not Found", { status: 404 });
  },
};
