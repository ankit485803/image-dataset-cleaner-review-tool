
import React from 'react';

function Header() {
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

      {/* Right — Status Badge */}
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

    </header>
  );
}

export default Header;