
import React, { useState } from 'react';

const STATUS_COLORS = {
  keep:         { bg: 'rgba(0,212,170,0.15)',  color: 'var(--keep)',   label: '✅ Keep'   },
  reject:       { bg: 'rgba(255,92,106,0.15)', color: 'var(--reject)', label: '❌ Reject' },
  needs_review: { bg: 'rgba(245,166,35,0.15)', color: 'var(--review)', label: '🔍 Review' },
};

// ─── Single image card inside panel ──────────────────────
function ImageCard({ img, onAction, showHash }) {
  const fmtSize = (b) => {
    if (!b) return 'Unknown';
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
  };

  const s = STATUS_COLORS[img.status] || STATUS_COLORS.needs_review;

  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      overflow: 'hidden',
      width: '160px',
      flexShrink: 0,
    }}>
      {/* Thumbnail */}
      <div style={{
        width: '100%', height: '110px',
        background: 'var(--surface)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {img.url
          ? <img src={img.url} alt={img.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '28px' }}>🖼️</span>
        }
      </div>

      {/* Info */}
      <div style={{ padding: '8px 10px' }}>
        <div style={{
          fontSize: '11px', fontWeight: '600', color: 'var(--text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: '4px',
        }}>
          {img.name}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>
          {fmtSize(img.size)}
        </div>

        {/* Hash preview */}
        {showHash && img.hash && (
          <div style={{
            fontSize: '9px', color: 'var(--accent2)',
            fontFamily: 'monospace', marginBottom: '6px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            #{img.hash.slice(0, 12)}...
          </div>
        )}

        {/* Current status */}
        <div style={{
          fontSize: '10px', fontWeight: '700',
          padding: '2px 6px', borderRadius: '20px',
          background: s.bg, color: s.color,
          display: 'inline-block', marginBottom: '8px',
        }}>
          {s.label}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => onAction(img.id, 'keep')}
            style={{
              flex: 1, padding: '4px 0',
              background: img.status === 'keep' ? 'var(--keep)' : 'transparent',
              border: '1px solid var(--keep)',
              borderRadius: '6px',
              color: img.status === 'keep' ? '#fff' : 'var(--keep)',
              fontSize: '11px', fontWeight: '700', cursor: 'pointer',
            }}>
            ✅
          </button>
          <button onClick={() => onAction(img.id, 'reject')}
            style={{
              flex: 1, padding: '4px 0',
              background: img.status === 'reject' ? 'var(--reject)' : 'transparent',
              border: '1px solid var(--reject)',
              borderRadius: '6px',
              color: img.status === 'reject' ? '#fff' : 'var(--reject)',
              fontSize: '11px', fontWeight: '700', cursor: 'pointer',
            }}>
            ❌
          </button>
          <button onClick={() => onAction(img.id, 'needs_review')}
            style={{
              flex: 1, padding: '4px 0',
              background: img.status === 'needs_review' ? 'var(--review)' : 'transparent',
              border: '1px solid var(--review)',
              borderRadius: '6px',
              color: img.status === 'needs_review' ? '#fff' : 'var(--review)',
              fontSize: '11px', fontWeight: '700', cursor: 'pointer',
            }}>
            🔍
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Group row (duplicates or similar) ───────────────────
function GroupRow({ group, onAction, showHash, type }) {
  const borderColor = type === 'duplicate' ? 'rgba(255,92,106,0.3)' : 'rgba(245,166,35,0.3)';
  const bgColor     = type === 'duplicate' ? 'rgba(255,92,106,0.05)' : 'rgba(245,166,35,0.05)';
  const labelColor  = type === 'duplicate' ? 'var(--reject)' : 'var(--review)';
  const label       = type === 'duplicate' ? '❌ Exact Duplicate Group' : '⚠️ Similar Group';

  // ── Keep first, reject rest in group ──
  const handleKeepFirst = () => {
    group.forEach((img, i) => {
      onAction(img.id, i === 0 ? 'keep' : 'reject');
    });
  };

  // ── Reject all in group ──
  const handleRejectAll = () => {
    group.forEach(img => onAction(img.id, 'reject'));
  };

  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '10px',
      padding: '14px',
      marginBottom: '12px',
    }}>
      {/* Group header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: labelColor }}>
            {label}
          </span>
          <span style={{
            background: labelColor, color: '#fff',
            fontSize: '10px', fontWeight: '700',
            padding: '1px 6px', borderRadius: '10px',
          }}>
            {group.length} images
          </span>
        </div>

        {/* Batch actions */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={handleKeepFirst}
            style={{
              padding: '4px 10px', fontSize: '11px', fontWeight: '600',
              background: 'rgba(0,212,170,0.15)', border: '1px solid var(--keep)',
              borderRadius: '6px', color: 'var(--keep)', cursor: 'pointer',
            }}>
            ✅ Keep First
          </button>
          <button onClick={handleRejectAll}
            style={{
              padding: '4px 10px', fontSize: '11px', fontWeight: '600',
              background: 'rgba(255,92,106,0.15)', border: '1px solid var(--reject)',
              borderRadius: '6px', color: 'var(--reject)', cursor: 'pointer',
            }}>
            ❌ Reject All
          </button>
        </div>
      </div>

      {/* Image cards row */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {group.map(img => (
          <ImageCard
            key={img.id}
            img={img}
            onAction={onAction}
            showHash={showHash}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────
function DuplicateReviewPanel({
  duplicateGroups,
  similarGroups,
  allImages,
  onAction,
  onClose,
  progress,
  isHashing,
}) {
  const [activeSection, setActiveSection] = useState('both'); // 'both' | 'duplicates' | 'similar'

  const totalDuplicates = duplicateGroups.reduce((acc, g) => acc + g.length, 0);
  const totalSimilar    = similarGroups.reduce((acc, g) => acc + g.length, 0);
  const hasIssues       = totalDuplicates > 0 || totalSimilar > 0;

  // ── get latest image data from allImages ──
  const hydrate = (group) =>
    group.map(img => allImages.find(i => i.id === img.id) || img);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        width: '100%', maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>
              🔍 Duplicate & Similar Review
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Review flagged images and mark them keep or reject
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none',
            color: 'var(--text-muted)', fontSize: '24px',
            cursor: 'pointer', lineHeight: 1,
          }}>×</button>
        </div>

        {/* ── Hashing Progress ── */}
        {isHashing && (
          <div style={{ padding: '20px 24px', flexShrink: 0 }}>
            <div style={{
              fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>⏳ Computing file hashes...</span>
              <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{progress}%</span>
            </div>
            <div style={{
              height: '6px', background: 'var(--border)',
              borderRadius: '6px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: '6px',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        {!isHashing && (
          <div style={{
            display: 'flex', gap: '8px',
            padding: '14px 24px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            {[
              { key: 'both',       label: 'All Flags',  count: totalDuplicates + totalSimilar },
              { key: 'duplicates', label: '❌ Exact Duplicates', count: totalDuplicates },
              { key: 'similar',    label: '⚠️ Similar',          count: totalSimilar    },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveSection(tab.key)}
                style={{
                  padding: '7px 14px', borderRadius: '8px', border: '1px solid',
                  borderColor: activeSection === tab.key ? 'var(--accent)' : 'var(--border)',
                  background: activeSection === tab.key ? 'rgba(108,99,255,0.15)' : 'transparent',
                  color: activeSection === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                }}>
                {tab.label}
                <span style={{
                  marginLeft: '6px',
                  background: 'var(--border)', borderRadius: '10px',
                  padding: '1px 6px', fontSize: '11px',
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Hashing in progress */}
          {isHashing && (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '200px', gap: '12px', color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: '48px' }}>⚙️</div>
              <div style={{ fontSize: '14px' }}>Analyzing {allImages.length} images...</div>
            </div>
          )}

          {/* No issues found */}
          {!isHashing && !hasIssues && (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '200px', gap: '12px',
            }}>
              <div style={{ fontSize: '48px' }}>✅</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--keep)' }}>
                No duplicates or similar images found!
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                All {allImages.length} images are unique.
              </div>
            </div>
          )}

          {/* ── Upper Panel: Similar ── */}
          {!isHashing && (activeSection === 'both' || activeSection === 'similar') && similarGroups.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '13px', fontWeight: '700',
                color: 'var(--review)', marginBottom: '12px',
                paddingBottom: '8px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                ⚠️ Similar Images
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>
                  — matched by filename similarity
                </span>
              </div>
              {similarGroups.map((group, i) => (
                <GroupRow
                  key={i}
                  group={hydrate(group)}
                  onAction={onAction}
                  showHash={false}
                  type="similar"
                />
              ))}
            </div>
          )}

          {/* ── Lower Panel: Exact Duplicates ── */}
          {!isHashing && (activeSection === 'both' || activeSection === 'duplicates') && duplicateGroups.length > 0 && (
            <div>
              <div style={{
                fontSize: '13px', fontWeight: '700',
                color: 'var(--reject)', marginBottom: '12px',
                paddingBottom: '8px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                ❌ Exact Duplicates
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>
                  — matched by MD5 file hash
                </span>
              </div>
              {duplicateGroups.map((group, i) => (
                <GroupRow
                  key={i}
                  group={hydrate(group)}
                  onAction={onAction}
                  showHash={true}
                  type="duplicate"
                />
              ))}
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        {!isHashing && (
          <div style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexShrink: 0,
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {totalDuplicates} exact duplicate{totalDuplicates !== 1 ? 's' : ''}
              &nbsp;·&nbsp;
              {totalSimilar} similar image{totalSimilar !== 1 ? 's' : ''}
            </div>
            <button onClick={onClose} style={{
              padding: '8px 24px',
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: '8px',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            }}>
              Done ✓
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default DuplicateReviewPanel;