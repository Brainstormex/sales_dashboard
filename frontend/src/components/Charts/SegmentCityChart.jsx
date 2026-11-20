import React, { useState } from 'react';
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

export default function SegmentCityChart({ data = { by_segment: [], by_city: [] } }) {
  const [activeTab, setActiveTab] = useState('segment'); // 'segment' or 'city'

  const currentList = activeTab === 'segment' 
    ? (data.by_segment || []) 
    : (data.by_city || []);

  const labels = currentList.map(item => item.customer_segment || item.city);
  const revenues = currentList.map(item => item.net_revenue);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Net Revenue (₹)',
        data: revenues,
        backgroundColor: activeTab === 'segment' ? 'rgba(139, 92, 246, 0.85)' : 'rgba(6, 182, 212, 0.85)',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: 'y', // Horizontal bar chart for clean text reading
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
            const rev = context.parsed.x || 0;
            const orders = currentList[index]?.order_count || 0;
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
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`
        }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#f8fafc', font: { size: 11, weight: '500' } }
      }
    }
  };

  return (
    <div className="card" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
            Revenue Breakdown
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Compare by customer segment or city
          </p>
        </div>

        <div style={{
          display: 'flex',
          backgroundColor: '#1f293d',
          borderRadius: '6px',
          padding: '2px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveTab('segment')}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'segment' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'segment' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s'
            }}
          >
            Segment
          </button>
          <button
            onClick={() => setActiveTab('city')}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'city' ? '#06b6d4' : 'transparent',
              color: activeTab === 'city' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s'
            }}
          >
            City
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: '220px' }}>
        {labels.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>
            No records for this selection
          </div>
        )}
      </div>
    </div>
  );
}
