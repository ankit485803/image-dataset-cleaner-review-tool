
import SparkMD5 from 'spark-md5';

// ─── Compute MD5 hash from a File object ─────────────────
export const computeHashFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const chunkSize  = 2 * 1024 * 1024; // 2MB chunks
    const chunks     = Math.ceil(file.size / chunkSize);
    const spark      = new SparkMD5.ArrayBuffer();
    const reader     = new FileReader();
    let currentChunk = 0;

    reader.onload = (e) => {
      spark.append(e.target.result);
      currentChunk++;
      if (currentChunk < chunks) {
        loadNextChunk();
      } else {
        resolve(spark.end()); // final MD5 hex string
      }
    };

    reader.onerror = () => reject(new Error(`Failed to hash file: ${file.name}`));

    const loadNextChunk = () => {
      const start = currentChunk * chunkSize;
      const end   = Math.min(start + chunkSize, file.size);
      reader.readAsArrayBuffer(file.slice(start, end));
    };

    loadNextChunk();
  });
};

// ─── Compute MD5 hash from a Blob URL ────────────────────
// Used when we only have a blob URL (zip imports)
export const computeHashFromURL = async (url) => {
  try {
    const response = await fetch(url);
    const buffer   = await response.arrayBuffer();
    const spark    = new SparkMD5.ArrayBuffer();
    spark.append(buffer);
    return spark.end();
  } catch {
    return null; // graceful failure for remote URLs
  }
};

// ─── Compute hashes for all images ───────────────────────
export const computeAllHashes = async (images, onProgress) => {
  const results = [];

  for (let i = 0; i < images.length; i++) {
    const img  = images[i];
    let   hash = img.hash; // skip if already computed

    if (!hash) {
      try {
        hash = await computeHashFromURL(img.url);
      } catch {
        hash = null;
      }
    }

    results.push({ ...img, hash });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / images.length) * 100));
    }
  }

  return results;
};

// ─── Find exact duplicates (same MD5 hash) ───────────────
export const findExactDuplicates = (images) => {
  const hashMap  = {}; // hash → [ids]
  const dupSet   = new Set();

  images.forEach(img => {
    if (!img.hash) return;
    if (!hashMap[img.hash]) hashMap[img.hash] = [];
    hashMap[img.hash].push(img.id);
  });

  // mark all images in a group as duplicates (keep first, flag rest)
  Object.values(hashMap).forEach(ids => {
    if (ids.length > 1) {
      ids.slice(1).forEach(id => dupSet.add(id)); // first is original
    }
  });

  return dupSet; // Set of duplicate image ids
};

// ─── Find similar images (filename based) ────────────────
export const findSimilarImages = (images) => {
  const simSet = new Set();

  const baseName = (name) =>
    name.toLowerCase().trim().replace(/\.[^/.]+$/, '');

  const similarityScore = (a, b) => {
    if (a === b) return 1;
    if (!a.length || !b.length) return 0;
    const longer  = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    let matches   = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    return matches / longer.length;
  };

  images.forEach((img, i) => {
    images.forEach((other, j) => {
      if (i >= j) return; // avoid double checking
      const baseA = baseName(img.name);
      const baseB = baseName(other.name);
      const score = similarityScore(baseA, baseB);
      if (score >= 0.7 && score < 1) {
        simSet.add(img.id);
        simSet.add(other.id);
      }
    });
  });

  return simSet; // Set of similar image ids
};

// ─── Group exact duplicates for panel display ─────────────
export const groupDuplicates = (images) => {
  const hashMap = {};

  images.forEach(img => {
    if (!img.hash) return;
    if (!hashMap[img.hash]) hashMap[img.hash] = [];
    hashMap[img.hash].push(img);
  });

  // only return groups with 2+ images
  return Object.values(hashMap).filter(group => group.length > 1);
};

// ─── Group similar images for panel display ───────────────
export const groupSimilar = (images) => {
  const baseName = (name) =>
    name.toLowerCase().trim().replace(/\.[^/.]+$/, '');

  const similarityScore = (a, b) => {
    if (a === b) return 1;
    if (!a.length || !b.length) return 0;
    const longer  = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    let matches   = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    return matches / longer.length;
  };

  const groups  = [];
  const visited = new Set();

  images.forEach((img, i) => {
    if (visited.has(img.id)) return;
    const group = [img];
    visited.add(img.id);

    images.forEach((other, j) => {
      if (i >= j || visited.has(other.id)) return;
      const score = similarityScore(baseName(img.name), baseName(other.name));
      if (score >= 0.7 && score < 1) {
        group.push(other);
        visited.add(other.id);
      }
    });

    if (group.length > 1) groups.push(group);
  });

  return groups;
};