import React from 'react';
import { TrendingUp, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export default function Navbar({ onRefresh, isRefreshing, lastUpdated }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(17, 24, 39, 0.85)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '0.85rem 1.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(217, 119, 6, 0.3)',
          color: '#ffffff'
        }}>
          <TrendingUp size={22} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              FINANCE
            </h1>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(217, 119, 6, 0.2)',
              color: '#f59e0b',
              border: '1px solid rgba(217, 119, 6, 0.4)',
              textTransform: 'uppercase'
            }}>
              Finance Dept
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Executive Sales & Revenue Performance Analytics
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          backgroundColor: 'rgba(31, 41, 61, 0.6)',
          padding: '0.35rem 0.75rem',
          borderRadius: '9999px',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 6px #10b981'
          }}></span>
          <span>Database: <strong>SQLite (sales.db)</strong></span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>{lastUpdated ? `Updated ${lastUpdated}` : 'Live'}</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #334466',
            backgroundColor: '#1a2335',
            color: '#f8fafc',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Reload raw data from Excel into SQLite database"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} style={{
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
          }} />
          {isRefreshing ? 'Reloading...' : 'Reload ETL'}
        </button>
      </div>
    </header>
  );
}
