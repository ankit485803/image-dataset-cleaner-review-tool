
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

// ─── Build clean metadata object for export ──────────────
const buildMetadata = (img) => ({
  id: img.id,
  filename: img.name,
  type: img.type,
  size_bytes: img.size,
  source: img.source,
  status: img.status,
  tags: img.tags || '',
  notes: img.notes || '',
  hash: img.hash || '',
  is_duplicate: !!img.isDuplicate,
  is_similar: !!img.isSimilar,
  imported_at: img.importedAt,
});

// ─── 1. Download metadata as JSON ─────────────────────────
export const exportAsJSON = (images, logs = []) => {
  const data = {
    exported_at: new Date().toISOString(),
    total_images: images.length,
    summary: {
      keep: images.filter(i => i.status === 'keep').length,
      reject: images.filter(i => i.status === 'reject').length,
      needs_review: images.filter(i => i.status === 'needs_review').length,
      duplicates: images.filter(i => i.isDuplicate).length,
      similar: images.filter(i => i.isSimilar).length,
    },
    images: images.map(buildMetadata),
    activity_log: logs,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, `image-dataset-export-${Date.now()}.json`);
};

// ─── 2. Download metadata as CSV ──────────────────────────
export const exportAsCSV = (images) => {
  const rows = images.map(buildMetadata);
  const csv  = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  saveAs(blob, `image-dataset-export-${Date.now()}.csv`);
};

// ─── 3. Full ZIP export: images organized by status + CSV + JSON + logs ──
export const exportAsZip = async (images, logs = [], onProgress) => {
  const zip = new JSZip();

  const folders = {
    keep:         zip.folder('keep'),
    reject:       zip.folder('reject'),
    needs_review: zip.folder('needs_review'),
  };

  let done = 0;
  const total = images.length;

  // ── Add each image to its status folder ──
  for (const img of images) {
    try {
      const response = await fetch(img.url);
      const blob     = await response.blob();
      const folder   = folders[img.status] || folders.needs_review;

      // avoid filename collisions
      let safeName = img.name;
      if (folder.file(safeName)) {
        const ext  = safeName.split('.').pop();
        const base = safeName.replace(/\.[^/.]+$/, '');
        safeName = `${base}-${img.id.slice(-5)}.${ext}`;
      }

      folder.file(safeName, blob);
    } catch (err) {
      console.warn(`Failed to fetch image for export: ${img.name}`, err);
    }

    done++;
    if (onProgress) onProgress(Math.round((done / total) * 100));
  }

  // ── Add metadata CSV ──
  const csvRows = images.map(buildMetadata);
  const csv     = Papa.unparse(csvRows);
  zip.file('metadata.csv', csv);

  // ── Add metadata JSON ──
  const jsonData = {
    exported_at: new Date().toISOString(),
    total_images: images.length,
    summary: {
      keep: images.filter(i => i.status === 'keep').length,
      reject: images.filter(i => i.status === 'reject').length,
      needs_review: images.filter(i => i.status === 'needs_review').length,
      duplicates: images.filter(i => i.isDuplicate).length,
      similar: images.filter(i => i.isSimilar).length,
    },
    images: csvRows,
  };
  zip.file('metadata.json', JSON.stringify(jsonData, null, 2));

  // ── Add activity log ──
  const logText = logs.length
    ? logs.map(l => `[${l.timestamp}] ${l.action}: ${l.details}`).join('\n')
    : 'No activity logged yet.';
  zip.file('activity_log.txt', logText);

  // ── Add README ──
  const readme = `Image Dataset Export
=====================

Exported: ${new Date().toLocaleString()}
Total images: ${images.length}

Folder structure:
- keep/          → Images marked as "Keep"
- reject/        → Images marked as "Reject"
- needs_review/  → Images not yet reviewed or marked "Needs Review"

Files:
- metadata.csv     → All image metadata in CSV format
- metadata.json    → All image metadata in JSON format (includes summary + activity log)
- activity_log.txt → Session activity log
`;
  zip.file('README.txt', readme);

  // ── Generate and download ──
  const content = await zip.generateAsync({ type: 'blob' }, (meta) => {
    if (onProgress) onProgress(Math.round(meta.percent));
  });

  saveAs(content, `image-dataset-export-${Date.now()}.zip`);
};