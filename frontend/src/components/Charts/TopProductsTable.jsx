import React from 'react';
import { Award, Package, ShoppingCart } from 'lucide-react';

export default function TopProductsTable({ data = [] }) {
  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Top 5 Best-Selling Products
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Ranked by total net revenue contribution (Bonus)
            </p>
          </div>
        </div>

        <span style={{
          fontSize: '0.7rem',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          fontWeight: 700
        }}>
          Bonus Metric
        </span>
      </div>

      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>#</th>
              <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Product Name</th>
              <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'center' }}>Units Sold</th>
              <th style={{ padding: '0.6rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Net Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((prod, idx) => {
              const rankColors = ['#f59e0b', '#94a3b8', '#b45309', '#3b82f6', '#8b5cf6'];
              return (
                <tr 
                  key={prod.product_id || idx}
                  style={{
                    borderBottom: '1px solid rgba(30, 41, 59, 0.5)',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(31, 41, 61, 0.9)',
                      color: rankColors[idx] || '#f8fafc',
                      border: `1px solid ${rankColors[idx] || '#334155'}`
                    }}>
                      {idx + 1}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600, color: '#f8fafc' }}>
                    {prod.product_name}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                      ({prod.product_id})
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>
                    <span style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(51, 65, 85, 0.4)',
                      fontSize: '0.72rem',
                      color: '#cbd5e1'
                    }}>
                      {prod.category}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    {prod.total_quantity}
                  </td>
                  <td style={{
                    padding: '0.65rem 0.5rem',
                    textAlign: 'right',
                    fontWeight: 700,
                    color: '#f8fafc',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    ₹{prod.total_revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                  No top products matching current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
