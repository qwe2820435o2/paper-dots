/** Tracks all blob URLs created for photos so they can be revoked on cleanup */
const activeBlobUrls = new Set<string>();

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("toBlob failed"));
      const url = URL.createObjectURL(blob);
      activeBlobUrls.add(url);
      resolve(url);
    }, "image/png");
  });
}

export function revokePhotoBlobUrls(urls: string[]) {
  for (const url of urls) {
    if (activeBlobUrls.has(url)) {
      URL.revokeObjectURL(url);
      activeBlobUrls.delete(url);
    }
  }
}

export function revokeAllPhotoBlobUrls() {
  for (const url of activeBlobUrls) {
    URL.revokeObjectURL(url);
  }
  activeBlobUrls.clear();
}
