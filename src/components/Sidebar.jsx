
import React from 'react';

function Sidebar({ stats, activeTab, setActiveTab }) {
  const tabs = [
    { key: 'all',         label: 'All Images',    emoji: '🗂️',  count: stats.total },
    { key: 'keep',        label: 'Keep',          emoji: '✅',  count: stats.keep },
    { key: 'reject',      label: 'Rejected',      emoji: '❌',  count: stats.reject },
    { key: 'needs_review',label: 'Needs Review',  emoji: '🔍',  count: stats.review },
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

      {/* Section Label */}
      <div style={{
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '1.5px',
        color: 'var(--text-muted)',
        padding: '0 8px',
        marginBottom: '8px',
        textTransform: 'uppercase',
      }}>
        Filter by Status
      </div>

      {/* Tabs */}
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === tab.key ? 'var(--surface2)' : 'transparent',
            color: activeTab === tab.key ? 'var(--text)' : 'var(--text-muted)',
            fontWeight: activeTab === tab.key ? '600' : '400',
            fontSize: '13px',
            transition: 'all 0.15s ease',
            borderLeft: activeTab === tab.key ? '3px solid var(--accent)' : '3px solid transparent',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </div>
          <span style={{
            background: 'var(--border)',
            borderRadius: '10px',
            padding: '1px 7px',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}>
            {tab.count}
          </span>
        </button>
      ))}

      {/* Divider */}
      <div style={{
        borderTop: '1px solid var(--border)',
        margin: '12px 0',
      }} />

      {/* Stats Summary */}
      <div style={{
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '1.5px',
        color: 'var(--text-muted)',
        padding: '0 8px',
        marginBottom: '8px',
        textTransform: 'uppercase',
      }}>
        Session Stats
      </div>

      {[
        { label: 'Total Imported', value: stats.total, color: 'var(--text)' },
        { label: 'Kept',           value: stats.keep,   color: 'var(--keep)' },
        { label: 'Rejected',       value: stats.reject, color: 'var(--reject)' },
        { label: 'In Review',      value: stats.review, color: 'var(--review)' },
      ].map(stat => (
        <div key={stat.label} style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '6px 12px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          <span>{stat.label}</span>
          <span style={{ color: stat.color, fontWeight: '600' }}>{stat.value}</span>
        </div>
      ))}

    </aside>
  );
}

export default Sidebar;