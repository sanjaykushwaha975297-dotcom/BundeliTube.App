/**
 * Safe Storage utility with automatic QuotaExceededError handling,
 * defensive serialization, and fallback mechanisms.
 */

// Install defensive wrapper on window.localStorage to protect against unhandled QuotaExceededError globally
if (typeof window !== 'undefined' && window.Storage) {
  try {
    const originalSetItem = window.Storage.prototype.setItem;
    window.Storage.prototype.setItem = function (key: string, value: string) {
      try {
        originalSetItem.call(this, key, value);
      } catch (err: any) {
        if (
          err &&
          (err.name === 'QuotaExceededError' ||
            err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
            err.code === 22 ||
            err.code === 1014 ||
            err.number === -2147024882)
        ) {
          console.warn(`[SafeStorage] QuotaExceededError prevented for key "${key}". Trimming cached media items.`);
          // Attempt to free space by clearing bulky media caches
          try {
            this.removeItem('bt_video_submissions');
            this.removeItem('bt_videos');
          } catch {}

          // Attempt retry once
          try {
            originalSetItem.call(this, key, value);
          } catch {
            // Silently absorb to prevent crashing the React app
            try {
              sessionStorage.setItem(key, value);
            } catch {}
          }
        } else {
          console.warn(`[SafeStorage] Could not write key "${key}":`, err);
        }
      }
    };
  } catch (initErr) {
    console.warn('[SafeStorage] Could not patch Storage prototype:', initErr);
  }
}

export const DEFAULT_FALLBACK_THUMBNAIL = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80';
export const DEFAULT_FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
export const DEFAULT_FALLBACK_BANNER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80';

/**
 * Ensures an image/media URL is never an empty string ("") which causes browser reload warnings.
 */
export function safeImageSrc(url?: string | null, fallback: string = DEFAULT_FALLBACK_THUMBNAIL): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }
  return url.trim();
}

/**
 * Strips huge blobs / base64 payloads from cached video lists before storing in localStorage,
 * replacing them with lightweight CDN placeholder URLs instead of empty strings.
 */
function sanitizeForCache(data: any): any {
  if (!data) return data;
  if (Array.isArray(data)) {
    // Keep max 50 items in local cache to prevent quota exhaustion
    return data.slice(0, 50).map((item) => sanitizeForCache(item));
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      // Replace large base64 data URLs with safe image placeholders (NEVER empty string)
      if (typeof v === 'string' && v.startsWith('data:video') && v.length > 5000) {
        cleaned[k] = undefined;
      } else if (typeof v === 'string' && v.startsWith('data:image') && v.length > 50000) {
        if (k.toLowerCase().includes('avatar') || k.toLowerCase().includes('logo')) {
          cleaned[k] = DEFAULT_FALLBACK_AVATAR;
        } else if (k.toLowerCase().includes('banner')) {
          cleaned[k] = DEFAULT_FALLBACK_BANNER;
        } else {
          cleaned[k] = DEFAULT_FALLBACK_THUMBNAIL;
        }
      } else {
        cleaned[k] = v;
      }
    }
    return cleaned;
  }
  return data;
}

/**
 * Recursively normalizes empty strings in thumbnail/avatar/banner fields to valid fallback URLs
 */
function normalizeEmptyMedia(data: any): any {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(normalizeEmptyMedia);
  }
  if (typeof data === 'object') {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === 'string' && !v.trim()) {
        if (k.toLowerCase().includes('avatar') || k.toLowerCase().includes('logo')) {
          res[k] = DEFAULT_FALLBACK_AVATAR;
        } else if (k.toLowerCase().includes('thumbnail') || k.toLowerCase().includes('image')) {
          res[k] = DEFAULT_FALLBACK_THUMBNAIL;
        } else if (k.toLowerCase().includes('banner')) {
          res[k] = DEFAULT_FALLBACK_BANNER;
        } else {
          res[k] = v;
        }
      } else if (typeof v === 'object') {
        res[k] = normalizeEmptyMedia(v);
      } else {
        res[k] = v;
      }
    }
    return res;
  }
  return data;
}

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.warn(`[SafeStorage] Error reading key "${key}":`, err);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (err: any) {
      console.warn(`[SafeStorage] Safe setItem handled error for "${key}":`, err?.message || err);
      try {
        sessionStorage.setItem(key, value);
      } catch {}
    }
  },

  setJSON: (key: string, data: any): void => {
    try {
      const sanitized = sanitizeForCache(data);
      const str = JSON.stringify(sanitized);
      safeStorage.setItem(key, str);
    } catch (err) {
      console.warn(`[SafeStorage] JSON serialization failed for "${key}":`, err);
    }
  },

  getJSON: <T>(key: string, defaultValue: T): T => {
    try {
      const item = safeStorage.getItem(key);
      if (!item) return defaultValue;
      const parsed = JSON.parse(item);
      return normalizeEmptyMedia(parsed) as T;
    } catch (err) {
      console.warn(`[SafeStorage] JSON parse failed for "${key}":`, err);
      return defaultValue;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[SafeStorage] Error removing key "${key}":`, err);
    }
  }
};
