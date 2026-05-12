export async function resizeImageToDataUrl(
  file: File,
  maxW: number,
  maxH: number,
  quality = 0.85
): Promise<string> {
  const originalUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(originalUrl);
    const { width, height } = fitWithin(img.width, img.height, maxW, maxH);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(originalUrl);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

function fitWithin(
  w: number,
  h: number,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  if (w <= maxW && h <= maxH) return { width: w, height: h };
  const scale = Math.min(maxW / w, maxH / h);
  return { width: w * scale, height: h * scale };
}
