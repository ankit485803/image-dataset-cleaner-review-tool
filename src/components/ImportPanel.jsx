

import React, { useState } from 'react';
import JSZip from 'jszip';
import Papa from 'papaparse';

// ─── Constants ───────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXTS  = ['jpg', 'jpeg', 'png'];
const MAX_SIZE_MB   = 5;
const MAX_SIZE_B    = MAX_SIZE_MB * 1024 * 1024;
const MIN_IMAGES    = 30;
const MAX_IMAGES    = 100;

// ─── Validators ──────────────────────────────────────────
const isAllowedType = (name, type = '') => {
  const ext = name.split('.').pop().toLowerCase();
  return ALLOWED_EXTS.includes(ext) || ALLOWED_TYPES.includes(type);
};

const validateBatch = (images, existing = []) => {
  const total = existing.length + images.length;
  const errors = [];

  if (images.length === 0)
    errors.push('No valid images found after filtering.');

  if (total > MAX_IMAGES)
    errors.push(`Too many images. Max allowed is ${MAX_IMAGES}. You have ${existing.length} already and tried to add ${images.length}.`);

  return errors;
};

// ─── Image Object Factory ─────────────────────────────────
const makeImage = (name, url, size = 0, source = 'local') => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name,
  url,
  size,
  type: name.split('.').pop().toLowerCase(),
  source,
  status: 'needs_review',
  notes: '',
  tags: '',
  hash: null,
  importedAt: new Date().toISOString(),
});

// ─── Component ────────────────────────────────────────────
function ImportPanel({ onImport, existingCount = 0 }) {
  const [activeMethod, setActiveMethod] = useState('folder');
  const [urlInput, setUrlInput]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState([]);
  const [skipped, setSkipped]           = useState([]);
  const [message, setMessage]           = useState('');

  const reset = () => { setErrors([]); setSkipped([]); setMessage(''); };

  // ── Filter files: type + size ──
  const filterFiles = (files) => {
    const valid = [], skippedList = [];

    files.forEach(({ name, size, type }) => {
      if (!isAllowedType(name, type)) {
        skippedList.push(`${name} — unsupported type (only jpg/jpeg/png allowed)`);
      } else if (size > MAX_SIZE_B) {
        skippedList.push(`${name} — exceeds ${MAX_SIZE_MB}MB limit (${(size / 1024 / 1024).toFixed(1)}MB)`);
      } else {
        valid.push({ name, size, type });
      }
    });

    return { valid, skippedList };
  };

  // ── Method 1: Local folder ──
  const handleFileInput = async (e) => {
    reset();
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setLoading(true);

    const { valid, skippedList } = filterFiles(
      files.map(f => ({ name: f.name, size: f.size, type: f.type, file: f }))
    );

    const batchErrors = validateBatch(valid, { length: existingCount });
    if (batchErrors.length) {
      setErrors(batchErrors);
      setSkipped(skippedList);
      setLoading(false);
      return;
    }

    const images = files
      .filter(f => valid.find(v => v.name === f.name))
      .map(f => makeImage(f.name, URL.createObjectURL(f), f.size, 'local'));

    onImport(images);
    setSkipped(skippedList);
    setMessage(`✅ Imported ${images.length} image${images.length > 1 ? 's' : ''}.`);
    setLoading(false);
    e.target.value = '';
  };

  // ── Method 2: ZIP ──
  const handleZipUpload = async (e) => {
    reset();
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setMessage('📦 Reading ZIP...');

    try {
      const zip      = new JSZip();
      const contents = await zip.loadAsync(file);
      const entries  = Object.values(contents.files).filter(f => !f.dir);

      // extract blobs first to get sizes
      const raw = await Promise.all(
        entries.map(async (f) => {
          const blob = await f.async('blob');
          const name = f.name.split('/').pop();
          return { name, size: blob.size, type: blob.type, blob };
        })
      );

      const { valid, skippedList } = filterFiles(raw);

      const batchErrors = validateBatch(valid, { length: existingCount });
      if (batchErrors.length) {
        setErrors(batchErrors);
        setSkipped(skippedList);
        setLoading(false);
        return;
      }

      const images = raw
        .filter(r => valid.find(v => v.name === r.name))
        .map(r => makeImage(r.name, URL.createObjectURL(r.blob), r.size, 'zip'));

      onImport(images);
      setSkipped(skippedList);
      setMessage(`✅ Imported ${images.length} image${images.length > 1 ? 's' : ''} from ZIP.`);
    } catch {
      setErrors(['❌ Failed to read ZIP file. Make sure it is a valid zip.']);
    }

    setLoading(false);
    e.target.value = '';
  };

  // ── Method 3: URLs ──
  const handleURLImport = () => {
    reset();
    const urls = urlInput.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
    if (!urls.length) return setErrors(['No valid URLs found. Each URL must start with http/https.']);

    const skippedList = [];
    const validURLs   = urls.filter(url => {
      const ext = url.split('?')[0].split('.').pop().toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        skippedList.push(`${url} — unsupported extension (only jpg/jpeg/png)`);
        return false;
      }
      return true;
    });

    const batchErrors = validateBatch(validURLs, { length: existingCount });
    if (batchErrors.length) {
      setErrors(batchErrors);
      setSkipped(skippedList);
      return;
    }

    const images = validURLs.map(url => {
      const name = url.split('/').pop().split('?')[0] || 'image.jpg';
      return makeImage(name, url, 0, url);
    });

    onImport(images);
    setSkipped(skippedList);
    setMessage(`✅ Imported ${images.length} image${images.length > 1 ? 's' : ''} from URLs.`);
    setUrlInput('');
  };

  // ── Method 4: CSV ──
  const handleCSVUpload = (e) => {
    reset();
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setMessage('📄 Parsing CSV...');

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const rows = results.data.filter(r => r.image_url || r.url || r.src);
        if (!rows.length) {
          setErrors(['No image_url column found. CSV must have an image_url, url, or src column.']);
          setLoading(false);
          return;
        }

        const skippedList = [];
        const validRows   = rows.filter(row => {
          const url = row.image_url || row.url || row.src;
          const ext = url.split('?')[0].split('.').pop().toLowerCase();
          if (!ALLOWED_EXTS.includes(ext)) {
            skippedList.push(`${url} — unsupported extension`);
            return false;
          }
          return true;
        });

        const batchErrors = validateBatch(validRows, { length: existingCount });
        if (batchErrors.length) {
          setErrors(batchErrors);
          setSkipped(skippedList);
          setLoading(false);
          return;
        }

        const images = validRows.map(row => {
          const url  = row.image_url || row.url || row.src;
          const name = row.name || url.split('/').pop().split('?')[0] || 'image.jpg';
          return makeImage(name, url, 0, url);
        });

        onImport(images);
        setSkipped(skippedList);
        setMessage(`✅ Imported ${images.length} image${images.length > 1 ? 's' : ''} from CSV.`);
        setLoading(false);
      },
      error: () => {
        setErrors(['Failed to parse CSV. Make sure it is a valid CSV file.']);
        setLoading(false);
      }
    });

    e.target.value = '';
  };

  const methods = [
    { key: 'folder', label: '📁 Folder', },
    { key: 'zip',    label: '📦 ZIP',    },
    { key: 'urls',   label: '🔗 URLs',   },
    { key: 'csv',    label: '📄 CSV',    },
  ];

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontWeight: '700', fontSize: '14px' }}>Import Images</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {existingCount}/{MAX_IMAGES} imported
          &nbsp;·&nbsp; min {MIN_IMAGES} required
          &nbsp;·&nbsp; jpg/jpeg/png only
          &nbsp;·&nbsp; max {MAX_SIZE_MB}MB each
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '4px', background: 'var(--border)',
        borderRadius: '4px', marginBottom: '16px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: '4px',
          width: `${Math.min((existingCount / MAX_IMAGES) * 100, 100)}%`,
          background: existingCount >= MIN_IMAGES ? 'var(--keep)' : 'var(--accent)',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Method Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {methods.map(m => (
          <button key={m.key} onClick={() => { setActiveMethod(m.key); reset(); }}
            style={{
              padding: '7px 14px', borderRadius: '8px', border: '1px solid',
              borderColor: activeMethod === m.key ? 'var(--accent)' : 'var(--border)',
              background: activeMethod === m.key ? 'rgba(108,99,255,0.15)' : 'transparent',
              color: activeMethod === m.key ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Import Area */}
      <div style={{
        background: 'var(--surface2)', borderRadius: '8px',
        padding: '16px', border: '1px dashed var(--border)',
      }}>

        {/* Folder */}
        {activeMethod === 'folder' && (
          <label style={{ cursor: 'pointer', display: 'block', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Select images from your computer
            </div>
            <input type="file" multiple accept=".jpg,.jpeg,.png"
              onChange={handleFileInput} style={{ display: 'none' }} />
            <span style={{
              background: 'var(--accent)', color: '#fff',
              padding: '8px 20px', borderRadius: '8px',
              fontSize: '13px', fontWeight: '600',
            }}>Browse Files</span>
          </label>
        )}

        {/* ZIP */}
        {activeMethod === 'zip' && (
          <label style={{ cursor: 'pointer', display: 'block', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Upload a ZIP containing jpg/jpeg/png images
            </div>
            <input type="file" accept=".zip"
              onChange={handleZipUpload} style={{ display: 'none' }} />
            <span style={{
              background: 'var(--accent)', color: '#fff',
              padding: '8px 20px', borderRadius: '8px',
              fontSize: '13px', fontWeight: '600',
            }}>Upload ZIP</span>
          </label>
        )}

        {/* URLs */}
        {activeMethod === 'urls' && (
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Paste image URLs — one per line (jpg/jpeg/png only)
            </div>
            <textarea value={urlInput} onChange={e => setUrlInput(e.target.value)}
              placeholder={`https://example.com/photo.jpg\nhttps://example.com/image.png`}
              rows={5}
              style={{
                width: '100%', padding: '10px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text)',
                fontSize: '12px', resize: 'vertical', fontFamily: 'monospace',
              }}
            />
            <button onClick={handleURLImport} style={{
              marginTop: '10px', padding: '8px 20px',
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: '8px',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            }}>Import URLs</button>
          </div>
        )}

        {/* CSV */}
        {activeMethod === 'csv' && (
          <label style={{ cursor: 'pointer', display: 'block', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              CSV must have an <code style={{ color: 'var(--accent2)' }}>image_url</code> column
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Optional columns: name
            </div>
            <input type="file" accept=".csv"
              onChange={handleCSVUpload} style={{ display: 'none' }} />
            <span style={{
              background: 'var(--accent)', color: '#fff',
              padding: '8px 20px', borderRadius: '8px',
              fontSize: '13px', fontWeight: '600',
            }}>Upload CSV</span>
          </label>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{
          marginTop: '12px', padding: '12px',
          background: 'rgba(255,92,106,0.1)', border: '1px solid rgba(255,92,106,0.3)',
          borderRadius: '8px',
        }}>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: '12px', color: 'var(--reject)', marginBottom: i < errors.length - 1 ? '4px' : 0 }}>
              ❌ {e}
            </div>
          ))}
        </div>
      )}

      {/* Skipped files */}
      {skipped.length > 0 && (
        <div style={{
          marginTop: '8px', padding: '10px 12px',
          background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '11px', color: 'var(--review)', fontWeight: '600', marginBottom: '4px' }}>
            ⚠️ {skipped.length} file{skipped.length > 1 ? 's' : ''} skipped:
          </div>
          {skipped.map((s, i) => (
            <div key={i} style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
              • {s}
            </div>
          ))}
        </div>
      )}

      {/* Success */}
      {message && !errors.length && (
        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--accent2)', fontWeight: '600' }}>
          {loading ? '⏳ Loading...' : message}
        </div>
      )}

    </div>
  );
}

export default ImportPanel;