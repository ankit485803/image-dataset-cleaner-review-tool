import React from 'react';

function Sidebar({ stats, activeTab, setActiveTab }) {
  const tabs = [
    { key: 'all',          label: 'All Images',   emoji: '🗂️',  count: stats.total   },
    { key: 'keep',         label: 'Keep',         emoji: '✅',  count: stats.keep    },
    { key: 'reject',       label: 'Rejected',     emoji: '❌',  count: stats.reject  },
    { key: 'needs_review', label: 'Needs Review', emoji: '🔍',  count: stats.review  },
  ];

  return (
    <aside style={{
      width: '220px',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      gap: '4px',
      flexShrink: 0,
    }}>

      {/* ── Filter by Status ── */}
      <div style={{
        fontSize: '10px', fontWeight: '700',
        letterSpacing: '1.5px', color: 'var(--text-muted)',
        padding: '0 8px', marginBottom: '8px',
        textTransform: 'uppercase',
      }}>
        Filter by Status
      </div>

      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px', borderRadius: '8px',
            border: 'none', cursor: 'pointer',
            background: activeTab === tab.key ? 'var(--surface2)' : 'transparent',
            color: activeTab === tab.key ? 'var(--text)' : 'var(--text-muted)',
            fontWeight: activeTab === tab.key ? '600' : '400',
            fontSize: '13px', transition: 'all 0.15s ease',
            borderLeft: activeTab === tab.key
              ? '3px solid var(--accent)'
              : '3px solid transparent',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </div>
          <span style={{
            background: 'var(--border)', borderRadius: '10px',
            padding: '1px 7px', fontSize: '11px', color: 'var(--text-muted)',
          }}>
            {tab.count}
          </span>
        </button>
      ))}

      {/* ── Divider ── */}
      <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0' }} />

      {/* ── Session Stats ── */}
      <div style={{
        fontSize: '10px', fontWeight: '700',
        letterSpacing: '1.5px', color: 'var(--text-muted)',
        padding: '0 8px', marginBottom: '8px',
        textTransform: 'uppercase',
      }}>
        Session Stats
      </div>

      {[
        { label: 'Total Imported', value: stats.total,      color: 'var(--text)'   },
        { label: 'Kept',           value: stats.keep,       color: 'var(--keep)'   },
        { label: 'Rejected',       value: stats.reject,     color: 'var(--reject)' },
        { label: 'In Review',      value: stats.review,     color: 'var(--review)' },
      ].map(stat => (
        <div key={stat.label} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '6px 12px', fontSize: '12px', color: 'var(--text-muted)',
        }}>
          <span>{stat.label}</span>
          <span style={{ color: stat.color, fontWeight: '600' }}>{stat.value}</span>
        </div>
      ))}

      {/* ── Divider ── */}
      <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0' }} />

      {/* ── Duplicate & Similar Stats ── */}
      <div style={{
        fontSize: '10px', fontWeight: '700',
        letterSpacing: '1.5px', color: 'var(--text-muted)',
        padding: '0 8px', marginBottom: '8px',
        textTransform: 'uppercase',
      }}>
        Flags
      </div>

      {[
        { label: 'Duplicates', value: stats.duplicates, color: 'var(--reject)', emoji: '❌' },
        { label: 'Similar',    value: stats.similar,    color: 'var(--review)', emoji: '⚠️' },
      ].map(stat => (
        <div key={stat.label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 12px', fontSize: '12px',
          borderRadius: '8px',
          background: stat.value > 0 ? `${stat.color}10` : 'transparent',
        }}>
          <span style={{ color: stat.value > 0 ? stat.color : 'var(--text-muted)', display: 'flex', gap: '6px' }}>
            <span>{stat.emoji}</span>
            <span>{stat.label}</span>
          </span>
          <span style={{
            color: stat.value > 0 ? stat.color : 'var(--text-muted)',
            fontWeight: '700', fontSize: '13px',
          }}>
            {stat.value}
          </span>
        </div>
      ))}

      {/* ── Progress bar toward min 30 ── */}
      {stats.total < 30 && (
        <>
          <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0' }} />
          <div style={{ padding: '0 8px' }}>
            <div style={{
              fontSize: '10px', color: 'var(--text-muted)',
              marginBottom: '6px', display: 'flex', justifyContent: 'space-between',
            }}>
              <span>Min. required</span>
              <span style={{ color: 'var(--accent)' }}>{stats.total}/30</span>
            </div>
            <div style={{
              height: '4px', background: 'var(--border)',
              borderRadius: '4px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: '4px',
                width: `${Math.min((stats.total / 30) * 100, 100)}%`,
                background: 'var(--accent)',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {30 - stats.total} more needed
            </div>
          </div>
        </>
      )}

    </aside>
  );
}

export default Sidebar;