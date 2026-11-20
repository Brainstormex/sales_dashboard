import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RevenueTrendChart({ data = [] }) {
  const labels = data.map(d => d.year_month);
  const revenues = data.map(d => d.net_revenue);
  const orderCounts = data.map(d => d.order_count);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Net Revenue (₹)',
        data: revenues,
        borderColor: '#3b82f6',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.45)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#1e293b',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        yAxisID: 'y',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
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
            const orders = orderCounts[index] || 0;
            return [
              ` Revenue: ₹${rev.toLocaleString('en-IN')}`,
              ` Orders: ${orders}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
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
            Monthly Revenue Trend
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Net sales timeline (excluding cancelled orders)
          </p>
        </div>
        <span style={{
          fontSize: '0.7rem',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          color: '#60a5fa',
          fontWeight: 600
        }}>
          Time-Series
        </span>
      </div>

      <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: '220px' }}>
        {data.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>
            No data available for selected filters
          </div>
        )}
      </div>
    </div>
  );
}
