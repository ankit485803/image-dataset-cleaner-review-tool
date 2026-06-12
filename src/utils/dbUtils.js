
import { get, set, del } from 'idb-keyval';

const SESSION_KEY = 'image-dataset-session';

// ─── Save current session to IndexedDB ───────────────────
// Converts blob URLs to actual Blobs so they survive page reload
export const saveSession = async (images) => {
  const records = await Promise.all(
    images.map(async (img) => {
      let blob = null;
      try {
        const response = await fetch(img.url);
        blob = await response.blob();
      } catch {
        blob = null; // remote URL that failed — store without blob
      }

      // strip the runtime-only `url` field (blob URL won't survive reload)
      const { url, ...rest } = img;

      return { ...rest, blob, originalUrl: img.source && img.source.startsWith('http') ? img.url : null };
    })
  );

  await set(SESSION_KEY, {
    savedAt: new Date().toISOString(),
    images: records,
  });

  return true;
};

// ─── Load session from IndexedDB ──────────────────────────
// Recreates blob URLs for each image
export const loadSession = async () => {
  const session = await get(SESSION_KEY);
  if (!session || !session.images) return null;

  const images = session.images.map((rec) => {
    const { blob, originalUrl, ...meta } = rec;
    let url;

    if (blob) {
      url = URL.createObjectURL(blob);
    } else if (originalUrl) {
      url = originalUrl; // fallback to remote URL
    } else {
      url = ''; // missing — will show placeholder icon
    }

    return { ...meta, url };
  });

  return { savedAt: session.savedAt, images };
};

// ─── Check if a saved session exists ──────────────────────
export const hasSession = async () => {
  const session = await get(SESSION_KEY);
  return !!(session && session.images && session.images.length > 0);
};

// ─── Clear saved session ──────────────────────────────────
export const clearSession = async () => {
  await del(SESSION_KEY);
  return true;
};