import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OrderStatusChart({ data = [] }) {
  const statusColorMap = {
    'Completed': { color: '#10b981', label: 'Completed' },
    'Returned': { color: '#f59e0b', label: 'Returned' },
    'Cancelled': { color: '#f43f5e', label: 'Cancelled' },
  };

  const labels = data.map(d => d.order_status);
  const counts = data.map(d => d.count);
  const backgroundColors = data.map(d => statusColorMap[d.order_status]?.color || '#94a3b8');

  const totalOrders = counts.reduce((acc, c) => acc + c, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: backgroundColors,
        borderColor: '#111827',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          boxWidth: 10,
          padding: 12,
          font: { size: 11, weight: '600' }
        }
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
            const item = data[index];
            return [
              ` Count: ${item.count} orders (${item.percentage}%)`,
              ` Revenue: ₹${item.total_net_revenue.toLocaleString('en-IN')}`
            ];
          }
        }
      }
    }
  };

  return (
    <div className="card" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
            Order Status Breakdown
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Fulfillment & return rate auditing
          </p>
        </div>
        <span style={{
          fontSize: '0.7rem',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          fontWeight: 600
        }}>
          Fulfillment
        </span>
      </div>

      <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: '210px' }}>
        {data.length > 0 ? (
          <>
            <Doughnut data={chartData} options={options} />
            <div style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {totalOrders}
              </div>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                Total Orders
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>
            No status data
          </div>
        )}
      </div>
    </div>
  );
}
