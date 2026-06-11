import React, { useState } from 'react';
import ReviewPanel from './ReviewPanel';
import DuplicateReviewPanel from './DuplicateReviewPanel';
import { computeAllHashes, groupDuplicates, groupSimilar } from '../utils/hashUtils';

const STATUS_COLORS = {
  keep:         { bg: 'rgba(0,212,170,0.15)',  color: 'var(--keep)',   label: '✅ Keep'   },
  reject:       { bg: 'rgba(255,92,106,0.15)', color: 'var(--reject)', label: '❌ Reject' },
  needs_review: { bg: 'rgba(245,166,35,0.15)', color: 'var(--review)', label: '🔍 Review' },
};

function Gallery({ images, activeTab, setImages, onUpdate }) {
  const [view, setView]                   = useState('gallery');
  const [selected, setSelected]           = useState(null);
  const [showDupPanel, setShowDupPanel]   = useState(false);
  const [isHashing, setIsHashing]         = useState(false);
  const [hashProgress, setHashProgress]   = useState(0);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [similarGroups, setSimilarGroups]     = useState([]);

  // ── Filter by tab ──
  const filtered = activeTab === 'all'
    ? images
    : images.filter(img => img.status === activeTab);

  // ── Update image fields ──
  const handleUpdate = (id, changes) => {
    setImages(prev =>
      prev.map(img => img.id === id ? { ...img, ...changes } : img)
    );
  };

  // ── Run Review: hash all → find groups → open panel ──
  const handleRunReview = async () => {
    if (images.length === 0) return;
    setShowDupPanel(true);
    setIsHashing(true);
    setHashProgress(0);

    // compute hashes with progress
    const hashed = await computeAllHashes(images, (pct) => {
      setHashProgress(pct);
    });

    // update images with hashes in state
    setImages(hashed);

    // find groups
    const dupGroups = groupDuplicates(hashed);
    const simGroups = groupSimilar(hashed);

    setDuplicateGroups(dupGroups);
    setSimilarGroups(simGroups);
    setIsHashing(false);
  };

  // ── Handle action from DuplicateReviewPanel ──
  const handleDupAction = (id, status) => {
    setImages(prev =>
      prev.map(img => img.id === id ? { ...img, status } : img)
    );
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

  // ── Empty state ──
  if (images.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '60vh', gap: '16px', color: 'var(--text-muted)',
      }}>
        <div style={{ fontSize: '64px' }}>🖼️</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>
          No images yet
        </div>
        <div style={{ fontSize: '14px', textAlign: 'center', maxWidth: '300px', lineHeight: '1.6' }}>
          Import images using the panel above to get started.
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '20px',
        flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Showing{' '}
          <span style={{ color: 'var(--text)', fontWeight: '600' }}>{filtered.length}</span>
          {' '}of{' '}
          <span style={{ color: 'var(--text)', fontWeight: '600' }}>{images.length}</span>
          {' '}images
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

          {/* Run Review Button */}
          <button onClick={handleRunReview}
            style={{
              padding: '7px 16px', borderRadius: '8px',
              border: '1px solid var(--accent)',
              background: 'rgba(108,99,255,0.15)',
              color: 'var(--accent)',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
            🔍 Run Review
          </button>

          {/* View Toggle */}
          <div style={{
            display: 'flex', gap: '4px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '4px',
          }}>
            {[
              { key: 'gallery', icon: '⊞', label: 'Gallery' },
              { key: 'table',   icon: '☰', label: 'Table'   },
            ].map(v => (
              <button key={v.key} onClick={() => setView(v.key)}
                style={{
                  padding: '5px 12px', borderRadius: '6px', border: 'none',
                  background: view === v.key ? 'var(--accent)' : 'transparent',
                  color: view === v.key ? '#fff' : 'var(--text-muted)',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Gallery View ── */}
      {view === 'gallery' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '16px',
        }}>
          {filtered.map(img => {
            const s = STATUS_COLORS[img.status] || STATUS_COLORS.needs_review;
            return (
              <div key={img.id}
                onClick={() => setSelected(img)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform   = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow   = '0 8px 24px rgba(0,0,0,0.35)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform   = 'translateY(0)';
                  e.currentTarget.style.boxShadow   = 'none';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '100%', height: '130px',
                  background: 'var(--surface2)', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  {img.url
                    ? <img src={img.url} alt={img.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '32px' }}>🖼️</span>
                  }
                  {img.isDuplicate && (
                    <div style={{
                      position: 'absolute', top: '6px', right: '6px',
                      background: 'rgba(255,92,106,0.9)', color: '#fff',
                      fontSize: '10px', fontWeight: '700',
                      padding: '2px 6px', borderRadius: '4px',
                    }}>DUP</div>
                  )}
                  {img.isSimilar && !img.isDuplicate && (
                    <div style={{
                      position: 'absolute', top: '6px', right: '6px',
                      background: 'rgba(245,166,35,0.9)', color: '#000',
                      fontSize: '10px', fontWeight: '700',
                      padding: '2px 6px', borderRadius: '4px',
                    }}>SIM</div>
                  )}
                </div>

                {/* Card info */}
                <div style={{ padding: '10px 12px' }}>
                  <div style={{
                    fontSize: '12px', fontWeight: '600', color: 'var(--text)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: '6px',
                  }}>
                    {img.name}
                  </div>
                  {[
                    { label: 'Type',   value: img.type?.toUpperCase() || '—' },
                    { label: 'Size',   value: fmtSize(img.size) },
                    { label: 'Source', value: img.source === 'local' || img.source === 'zip' ? img.source : 'URL' },
                  ].map(row => (
                    <div key={row.label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '11px', marginBottom: '2px',
                    }}>
                      <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                      <span style={{ color: 'var(--text)', fontWeight: '500' }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{
                    marginTop: '8px', display: 'inline-block',
                    fontSize: '10px', fontWeight: '700',
                    padding: '2px 8px', borderRadius: '20px',
                    background: s.bg, color: s.color,
                  }}>
                    {s.label}
                  </div>
                  {img.tags && (
                    <div style={{
                      marginTop: '6px', fontSize: '10px',
                      color: 'var(--accent2)', fontStyle: 'italic',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      🏷️ {img.tags}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Table View ── */}
      {view === 'table' && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '10px', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Preview', 'Filename', 'Type', 'Size', 'Source', 'Status', 'Tags', 'Flags', 'Imported'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: '11px', fontWeight: '700',
                    color: 'var(--text-muted)', letterSpacing: '0.8px',
                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((img, idx) => {
                const s = STATUS_COLORS[img.status] || STATUS_COLORS.needs_review;
                return (
                  <tr key={img.id}
                    onClick={() => setSelected(img)}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '6px',
                        overflow: 'hidden', background: 'var(--surface2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {img.url
                          ? <img src={img.url} alt={img.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '18px' }}>🖼️</span>
                        }
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text)', fontWeight: '500', maxWidth: '180px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {img.name}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      {img.type?.toUpperCase() || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {fmtSize(img.size)}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      {img.source === 'local' || img.source === 'zip' ? img.source : 'URL'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '700',
                        padding: '3px 8px', borderRadius: '20px',
                        background: s.bg, color: s.color,
                      }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--accent2)', fontSize: '11px', maxWidth: '100px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {img.tags || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {img.isDuplicate && (
                        <span style={{ color: 'var(--reject)', fontWeight: '700', marginRight: '4px' }}>DUP</span>
                      )}
                      {img.isSimilar && !img.isDuplicate && (
                        <span style={{ color: 'var(--review)', fontWeight: '700' }}>SIM</span>
                      )}
                      {!img.isDuplicate && !img.isSimilar && (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {fmtDate(img.importedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Review Panel (single image) ── */}
      <ReviewPanel
        image={selected ? images.find(img => img.id === selected.id) : null}
        allImages={images}
        onUpdate={handleUpdate}
        onClose={() => setSelected(null)}
      />

      {/* ── Duplicate Review Panel ── */}
      {showDupPanel && (
        <DuplicateReviewPanel
          duplicateGroups={duplicateGroups}
          similarGroups={similarGroups}
          allImages={images}
          onAction={handleDupAction}
          onClose={() => setShowDupPanel(false)}
          progress={hashProgress}
          isHashing={isHashing}
        />
      )}

    </div>
  );
}

export default Gallery;