import React from 'react';

function Header({ onSaveSession, onLoadSession, onNewSession, hasSavedSession, lastSaved, isSaving }) {

  const fmtTime = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>

      {/* Left — Logo + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
        }}>
          🖼️
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '0.3px' }}>
            Image Dataset Cleaner
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Review · Tag · Export
          </div>
        </div>
      </div>

      {/* Right — Session controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Last saved indicator */}
        {lastSaved && !isSaving && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            💾 Saved at {fmtTime(lastSaved)}
          </div>
        )}
        {isSaving && (
          <div style={{ fontSize: '11px', color: 'var(--accent2)' }}>
            ⏳ Saving...
          </div>
        )}

        {/* Load Session */}
        {hasSavedSession && (
          <button onClick={onLoadSession} style={btnStyle('var(--accent)')}>
            📂 Load Session
          </button>
        )}

        {/* Save Session */}
        <button onClick={onSaveSession} disabled={isSaving} style={{
          ...btnStyle('var(--accent2)'),
          opacity: isSaving ? 0.6 : 1,
          cursor: isSaving ? 'not-allowed' : 'pointer',
        }}>
          💾 Save Session
        </button>

        {/* New Session */}
        <button onClick={onNewSession} style={btnStyle('var(--reject)')}>
          🆕 New Session
        </button>

        {/* Status Badge */}
        <div style={{
          fontSize: '12px',
          color: 'var(--accent2)',
          background: 'rgba(0, 212, 170, 0.1)',
          border: '1px solid rgba(0, 212, 170, 0.3)',
          borderRadius: '20px',
          padding: '4px 12px',
          fontWeight: '600',
        }}>
          ● Ready
        </div>
      </div>

    </header>
  );
}

// ── Shared button style ──
const btnStyle = (color) => ({
  padding: '6px 14px',
  borderRadius: '8px',
  border: `1px solid ${color}`,
  background: `${color}15`,
  color: color,
  fontSize: '12px',
  fontWeight: '700',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

export default Header;