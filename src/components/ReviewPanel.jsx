

import React, { useState, useEffect } from 'react';

const STATUS_OPTIONS = [
  { key: 'keep',         label: 'Keep',         emoji: '✅', color: 'var(--keep)',   bg: 'rgba(0,212,170,0.15)'  },
  { key: 'reject',       label: 'Reject',       emoji: '❌', color: 'var(--reject)', bg: 'rgba(255,92,106,0.15)' },
  { key: 'needs_review', label: 'Needs Review', emoji: '🔍', color: 'var(--review)', bg: 'rgba(245,166,35,0.15)' },
];

function ReviewPanel({ image, onUpdate, onClose, allImages }) {
  const [status, setStatus] = useState('needs_review');
  const [notes,  setNotes]  = useState('');
  const [tags,   setTags]   = useState('');

  // ── Sync state when image changes ──
  useEffect(() => {
    if (image) {
      setStatus(image.status || 'needs_review');
      setNotes(image.notes   || '');
      setTags(image.tags     || '');
    }
  }, [image]);

  if (!image) return null;

  // ── Save changes ──
  const handleSave = () => {
    onUpdate(image.id, { status, notes, tags: tags.trim() });
    onClose();
  };

  // ── Format helpers ──
  const fmtSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
  };

  // ── Duplicate detection by filename ──
  const getDuplicates = () => {
    if (!allImages || !image) return [];
    const name = image.name.toLowerCase().trim();
    return allImages.filter(img =>
      img.id !== image.id &&
      img.name.toLowerCase().trim() === name
    );
  };

  // ── Similar detection by filename (without extension) ──
  const getSimilar = () => {
    if (!allImages || !image) return [];
    const baseName = image.name.toLowerCase().trim().replace(/\.[^/.]+$/, '');
    if (baseName.length < 3) return [];
    return allImages.filter(img => {
      if (img.id === image.id) return false;
      const imgBase = img.name.toLowerCase().trim().replace(/\.[^/.]+$/, '');
      // similar if one name contains the other or they share 70%+ characters
      return (
        imgBase.includes(baseName) ||
        baseName.includes(imgBase) ||
        similarity(baseName, imgBase) >= 0.7
      );
    });
  };

  // ── Simple similarity score (0 to 1) ──
  const similarity = (a, b) => {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;
    const longer  = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    let matches   = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    return matches / longer.length;
  };

  const duplicates = getDuplicates();
  const similar    = getSimilar();
  const activeStatus = STATUS_OPTIONS.find(s => s.key === status);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 900,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: '360px', height: '100vh',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        zIndex: 901, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ fontWeight: '700', fontSize: '14px' }}>Review Image</div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none',
            color: 'var(--text-muted)', fontSize: '20px',
            cursor: 'pointer', lineHeight: 1,
          }}>×</button>
        </div>

        {/* ── Image Preview ── */}
        <div style={{
          width: '100%', height: '200px',
          background: 'var(--surface2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}>
          {image.url
            ? <img src={image.url} alt={image.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            : <span style={{ fontSize: '48px' }}>🖼️</span>
          }
        </div>

        {/* ── Scrollable Body ── */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

          {/* Filename */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Filename
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', wordBreak: 'break-all' }}>
              {image.name}
            </div>
          </div>

          {/* Metadata grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Type',       value: image.type?.toUpperCase() || '—' },
              { label: 'Size',       value: fmtSize(image.size) },
              { label: 'Source',     value: image.source === 'local' || image.source === 'zip' ? image.source : 'URL' },
              { label: 'Imported',   value: fmtDate(image.importedAt) },
              { label: 'Hash',       value: image.hash || 'Not computed' },
              { label: 'Duplicate',  value: duplicates.length > 0 ? `⚠️ ${duplicates.length} found` : '✅ None' },
            ].map(row => (
              <div key={row.label} style={{
                background: 'var(--surface2)', borderRadius: '8px', padding: '8px 10px',
              }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {row.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '500', wordBreak: 'break-all' }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Duplicate Warning ── */}
          {duplicates.length > 0 && (
            <div style={{
              background: 'rgba(255,92,106,0.1)', border: '1px solid rgba(255,92,106,0.3)',
              borderRadius: '8px', padding: '12px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--reject)', marginBottom: '6px' }}>
                ❌ Exact Duplicate Filename ({duplicates.length})
              </div>
              {duplicates.map(d => (
                <div key={d.id} style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  • {d.name}
                </div>
              ))}
            </div>
          )}

          {/* ── Similar Warning ── */}
          {similar.length > 0 && (
            <div style={{
              background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)',
              borderRadius: '8px', padding: '12px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--review)', marginBottom: '6px' }}>
                ⚠️ Similar Filenames ({similar.length})
              </div>
              {similar.map(s => (
                <div key={s.id} style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  • {s.name}
                </div>
              ))}
            </div>
          )}

          {/* ── Status ── */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Review Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {STATUS_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setStatus(opt.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderRadius: '8px', border: '2px solid',
                    borderColor: status === opt.key ? opt.color : 'var(--border)',
                    background: status === opt.key ? opt.bg : 'transparent',
                    color: status === opt.key ? opt.color : 'var(--text-muted)',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  <span style={{ fontSize: '16px' }}>{opt.emoji}</span>
                  <span>{opt.label}</span>
                  {status === opt.key && (
                    <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓ Selected</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tags ── */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Tags <span style={{ color: 'var(--text-muted)', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(comma separated)</span>
            </div>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. nature, outdoor, hd"
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text)',
                fontSize: '13px', outline: 'none',
              }}
            />
            {/* Tag chips preview */}
            {tags && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                  <span key={t} style={{
                    background: 'rgba(108,99,255,0.15)', color: 'var(--accent)',
                    fontSize: '11px', fontWeight: '600',
                    padding: '3px 8px', borderRadius: '20px',
                  }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Notes ── */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Notes
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add any notes about this image..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text)',
                fontSize: '13px', resize: 'vertical', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* ── Save Button ── */}
          <button onClick={handleSave} style={{
            width: '100%', padding: '12px',
            background: activeStatus?.color || 'var(--accent)',
            border: 'none', borderRadius: '8px',
            color: '#fff', fontSize: '14px',
            fontWeight: '700', cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {activeStatus?.emoji} Save as {activeStatus?.label}
          </button>

        </div>
      </div>
    </>
  );
}

export default ReviewPanel;