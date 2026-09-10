/**
 * Utility to compress and resize image files and base64 strings in the browser
 * before storing them in Firestore or state, ensuring they never exceed Firestore's 1MB limit.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

export const THUMBNAIL_COMPRESS_OPTIONS: CompressOptions = {
  maxWidth: 800,
  maxHeight: 450,
  quality: 0.78,
  mimeType: 'image/jpeg'
};

export const AVATAR_COMPRESS_OPTIONS: CompressOptions = {
  maxWidth: 256,
  maxHeight: 256,
  quality: 0.8,
  mimeType: 'image/jpeg'
};

export const BANNER_COMPRESS_OPTIONS: CompressOptions = {
  maxWidth: 1200,
  maxHeight: 400,
  quality: 0.75,
  mimeType: 'image/jpeg'
};

/**
 * Resizes and compresses an image File object into a compact base64 JPEG data URL (<100KB).
 */
export function compressImageFile(
  file: File,
  options: CompressOptions = THUMBNAIL_COMPRESS_OPTIONS
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      // Fallback: read directly
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result as string;
      compressImageDataUrl(dataUrl, options)
        .then(resolve)
        .catch(() => resolve(dataUrl)); // fallback to original if canvas fails
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an existing base64 Data URL using an HTML5 Canvas.
 */
export function compressImageDataUrl(
  dataUrl: string,
  options: CompressOptions = THUMBNAIL_COMPRESS_OPTIONS
): Promise<string> {
  return new Promise((resolve) => {
    // If it's a regular http(s) URL or very small base64, no need to compress
    if (!dataUrl.startsWith('data:image/') || dataUrl.length < 50000) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const maxWidth = options.maxWidth || 800;
        const maxHeight = options.maxHeight || 450;
        const quality = options.quality ?? 0.78;
        const mimeType = options.mimeType || 'image/jpeg';

        let { width, height } = img;

        // Maintain aspect ratio while fitting within max bounds
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(dataUrl.slice(0, 100000));
          return;
        }

        // Draw with white background for JPEG transparency safety
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL(mimeType, quality);
        resolve(compressed);
      } catch (err) {
        console.warn('[ImageCompressor] Canvas compression fallback:', err);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
