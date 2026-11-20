import React from 'react';

export default function KpiCard({ title, value, subtitle, icon: Icon, color = 'blue', badge }) {
  const colorMap = {
    amber: { bg: 'rgba(217, 119, 6, 0.12)', text: '#fbbf24', border: 'rgba(217, 119, 6, 0.3)' },
    blue: { bg: 'rgba(37, 99, 235, 0.12)', text: '#60a5fa', border: 'rgba(37, 99, 235, 0.3)' },
    emerald: { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    violet: { bg: 'rgba(139, 92, 246, 0.12)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
    cyan: { bg: 'rgba(6, 182, 212, 0.12)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' },
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className="card fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          {title}
        </span>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: currentTheme.bg,
          border: `1px solid ${currentTheme.border}`,
          color: currentTheme.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {Icon && <Icon size={18} strokeWidth={2.2} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <span style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#ffffff',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '-0.03em'
        }}>
          {value}
        </span>
        {badge && (
          <span style={{
            fontSize: '0.72rem',
            padding: '0.15rem 0.45rem',
            borderRadius: '9999px',
            backgroundColor: currentTheme.bg,
            color: currentTheme.text,
            fontWeight: 700
          }}>
            {badge}
          </span>
        )}
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 'auto' }}>
        {subtitle}
      </div>

      {/* Subtle background glow */}
      <div style={{
        position: 'absolute',
        bottom: '-20px',
        right: '-20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: currentTheme.text,
        opacity: 0.04,
        pointerEvents: 'none'
      }} />
    </div>
  );
}
