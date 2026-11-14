import { SearchableAd, VisualSearchAnalysis } from './localSearchEngine';

export interface ImageSearchResponse {
  success: boolean;
  analysis: VisualSearchAnalysis;
  exactQuery: string;
  matches: Array<{
    ad: SearchableAd;
    resolvedTitle: string;
    resolvedCategory: string;
    resolvedSubcategory: string;
    numericPrice: number;
    matchScore: number;
    matchPercentage: number;
    matchReasons: string[];
  }>;
  error?: string;
}

export const IMAGE_SEARCH_SESSION_KEY = 'yegna_exact_image_search_v1';

export function prepareImageForVisualSearch(file: File, maxDimension: number = 1200): Promise<{
  base64: string;
  mimeType: string;
  previewDataUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected image file.'));
    reader.onload = () => {
      const originalDataUrl = String(reader.result || '');
      const img = new Image();
      img.onerror = () => {
        const mimeType = file.type || 'image/jpeg';
        const base64 = originalDataUrl.replace(/^data:[^;]+;base64,/, '');
        resolve({ base64, mimeType, previewDataUrl: originalDataUrl });
      };
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width || 1, img.height || 1));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const mimeType = file.type || 'image/jpeg';
          const base64 = originalDataUrl.replace(/^data:[^;]+;base64,/, '');
          resolve({ base64, mimeType, previewDataUrl: originalDataUrl });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const base64 = compressedDataUrl.replace(/^data:image\/jpeg;base64,/, '');
        resolve({
          base64,
          mimeType: 'image/jpeg',
          previewDataUrl: compressedDataUrl,
        });
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export async function runExactImageSearch(params: {
  file: File;
  clientAds?: SearchableAd[];
}): Promise<ImageSearchResponse & { previewDataUrl: string }> {
  const prepared = await prepareImageForVisualSearch(params.file);

  const response = await fetch('/api/image-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: prepared.base64,
      mimeType: prepared.mimeType,
      ads: Array.isArray(params.clientAds) ? params.clientAds.slice(0, 120) : [],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'AI exact image search failed.');
  }

  return {
    ...data,
    previewDataUrl: prepared.previewDataUrl,
  };
}
