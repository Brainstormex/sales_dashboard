import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function CategoryRevenueChart({ data = [] }) {
  const labels = data.map(d => d.category);
  const revenues = data.map(d => d.net_revenue);

  const colors = [
    'rgba(217, 119, 6, 0.85)',
    'rgba(37, 99, 235, 0.85)',
    'rgba(16, 185, 129, 0.85)',
    'rgba(139, 92, 246, 0.85)',
    'rgba(6, 182, 212, 0.85)',
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Net Revenue (₹)',
        data: revenues,
        backgroundColor: colors.slice(0, labels.length),
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const rev = context.parsed.y || 0;
            const pct = data[index]?.percentage || 0;
            const orders = data[index]?.order_count || 0;
            return [
              ` Net Revenue: ₹${rev.toLocaleString('en-IN')} (${pct}%)`,
              ` Total Orders: ${orders}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  return (
    <div className="card" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
            Revenue by Product Category
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total contribution per merchandise category
          </p>
        </div>
        <span style={{
          fontSize: '0.7rem',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: 'rgba(217, 119, 6, 0.15)',
          color: '#f59e0b',
          fontWeight: 600
        }}>
          Categories
        </span>
      </div>

      <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: '220px' }}>
        {data.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>
            No category data available
          </div>
        )}
      </div>
    </div>
  );
}
