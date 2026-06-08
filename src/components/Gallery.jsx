
import React from 'react';

function Gallery({ images, activeTab, setImages }) {

  const filtered = activeTab === 'all'
    ? images
    : images.filter(img => img.status === activeTab);

  // Empty state
  if (images.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '16px',
        color: 'var(--text-muted)',
      }}>
        <div style={{ fontSize: '64px' }}>🖼️</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>
          No images yet
        </div>
        <div style={{ fontSize: '14px', textAlign: 'center', maxWidth: '300px', lineHeight: '1.6' }}>
          Import images to get started. We'll add the import panel in the next step.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Showing <span style={{ color: 'var(--text)', fontWeight: '600' }}>{filtered.length}</span> images
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px',
      }}>
        {filtered.map(img => (
          <div key={img.id} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Image preview */}
            <div style={{
              width: '100%',
              height: '130px',
              background: 'var(--surface2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '32px' }}>🖼️</span>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: '10px 12px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '4px',
              }}>
                {img.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {img.size ? `${(img.size / 1024).toFixed(1)} KB` : 'Unknown size'}
              </div>

              {/* Status badge */}
              <div style={{
                marginTop: '8px',
                display: 'inline-block',
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '20px',
                background:
                  img.status === 'keep' ? 'rgba(0,212,170,0.15)' :
                  img.status === 'reject' ? 'rgba(255,92,106,0.15)' :
                  'rgba(245,166,35,0.15)',
                color:
                  img.status === 'keep' ? 'var(--keep)' :
                  img.status === 'reject' ? 'var(--reject)' :
                  'var(--review)',
              }}>
                {img.status === 'keep' ? '✅ Keep' :
                 img.status === 'reject' ? '❌ Reject' :
                 '🔍 Review'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;