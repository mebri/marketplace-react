// FILE: src/utils/imageSearchClient.js

export const IMAGE_SEARCH_SESSION_KEY = "yegna_exact_image_search_v1";

export function prepareImageForVisualSearch(file, maxDimension = 1200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read selected image file."));
    reader.onload = () => {
      const originalDataUrl = String(reader.result || "");
      const img = new Image();
      img.onerror = () => {
        const mimeType = file.type || "image/jpeg";
        const base64 = originalDataUrl.replace(/^data:[^;]+;base64,/, "");
        resolve({ base64, mimeType, previewDataUrl: originalDataUrl });
      };
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width || 1, img.height || 1));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const mimeType = file.type || "image/jpeg";
          const base64 = originalDataUrl.replace(/^data:[^;]+;base64,/, "");
          resolve({ base64, mimeType, previewDataUrl: originalDataUrl });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const base64 = compressedDataUrl.replace(/^data:image\/jpeg;base64,/, "");
        resolve({
          base64,
          mimeType: "image/jpeg",
          previewDataUrl: compressedDataUrl,
        });
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export async function runExactImageSearch({ file, clientAds = [] }) {
  const prepared = await prepareImageForVisualSearch(file);

  const response = await fetch("/api/image-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: prepared.base64,
      mimeType: prepared.mimeType,
      ads: Array.isArray(clientAds) ? clientAds.slice(0, 120) : [],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "AI exact image search failed.");
  }

  return {
    ...data,
    previewDataUrl: prepared.previewDataUrl,
  };
}
