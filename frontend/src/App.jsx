import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import KpiCard from './components/KpiCard';
import RevenueTrendChart from './components/Charts/RevenueTrendChart';
import CategoryRevenueChart from './components/Charts/CategoryRevenueChart';
import SegmentCityChart from './components/Charts/SegmentCityChart';
import OrderStatusChart from './components/Charts/OrderStatusChart';
import TopProductsTable from './components/Charts/TopProductsTable';

import {
  fetchFilterOptions,
  fetchKPIs,
  fetchMonthlyRevenue,
  fetchCategoryRevenue,
  fetchSegmentCityRevenue,
  fetchOrderStatusDistribution,
  fetchTopProducts,
  triggerDataReload,
} from './api';

import {
  IndianRupee,
  ShoppingBag,
  Users,
  Calculator,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [filterOptions, setFilterOptions] = useState({
    min_date: '',
    max_date: '',
    categories: [],
    order_statuses: [],
    customer_segments: [],
    cities: [],
  });

  const [selectedFilters, setSelectedFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    orderStatus: '',
    customerSegment: '',
    city: '',
  });

  const [kpis, setKpis] = useState({
    total_net_revenue: 0,
    total_orders: 0,
    unique_customers: 0,
    average_order_value: 0,
    repeat_customer_rate: 0,
    non_cancelled_orders: 0,
  });

  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [segmentCityData, setSegmentCityData] = useState({ by_segment: [], by_city: [] });
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  // Load Filter Options initially
  useEffect(() => {
    async function initOptions() {
      try {
        const options = await fetchFilterOptions();
        setFilterOptions(options);
      } catch (err) {
        console.error('Failed to load filter options:', err);
        setErrorMsg('Unable to connect to FastAPI backend at http://localhost:8000. Please ensure the backend is running.');
      }
    }
    initOptions();
  }, []);

  // Fetch Dashboard Data based on active filters
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const queryParams = {};
      if (selectedFilters.startDate) queryParams.start_date = selectedFilters.startDate;
      if (selectedFilters.endDate) queryParams.end_date = selectedFilters.endDate;
      if (selectedFilters.category) queryParams.category = selectedFilters.category;
      if (selectedFilters.orderStatus) queryParams.order_status = selectedFilters.orderStatus;
      if (selectedFilters.customerSegment) queryParams.customer_segment = selectedFilters.customerSegment;
      if (selectedFilters.city) queryParams.city = selectedFilters.city;

      const [kpiRes, trendRes, catRes, segCityRes, statusRes, topProdRes] = await Promise.all([
        fetchKPIs(queryParams),
        fetchMonthlyRevenue(queryParams),
        fetchCategoryRevenue(queryParams),
        fetchSegmentCityRevenue(queryParams),
        fetchOrderStatusDistribution(queryParams),
        fetchTopProducts(queryParams),
      ]);

      setKpis(kpiRes);
      setMonthlyTrend(trendRes);
      setCategoryData(catRes);
      setSegmentCityData(segCityRes);
      setOrderStatusData(statusRes);
      setTopProducts(topProdRes);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setErrorMsg('Failed to query sales metrics. Please check the backend connection.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilters]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Manual Data Reload from Excel into DB
  const handleReloadData = async () => {
    setIsRefreshing(true);
    try {
      await triggerDataReload();
      const options = await fetchFilterOptions();
      setFilterOptions(options);
      await loadDashboardData();
    } catch (err) {
      console.error('Reload failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedFilters({
      startDate: '',
      endDate: '',
      category: '',
      orderStatus: '',
      customerSegment: '',
      city: '',
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        onRefresh={handleReloadData} 
        isRefreshing={isRefreshing} 
        lastUpdated={lastUpdated} 
      />

      <main style={{ flex: 1, padding: '1.5rem 1.75rem', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Dynamic Filter Controls */}
        <FilterBar 
          filterOptions={filterOptions}
          selectedFilters={selectedFilters}
          onChange={setSelectedFilters}
          onReset={handleResetFilters}
        />

        {/* 5 KPI Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <KpiCard
            title="Total Net Revenue"
            value={`₹${kpis.total_net_revenue.toLocaleString('en-IN')}`}
            subtitle="Cancelled orders excluded (₹0 net)"
            icon={IndianRupee}
            color="amber"
          />
          <KpiCard
            title="Total Orders"
            value={kpis.total_orders.toLocaleString()}
            subtitle={`${kpis.non_cancelled_orders} non-cancelled orders`}
            icon={ShoppingBag}
            color="blue"
          />
          <KpiCard
            title="Unique Customers"
            value={kpis.unique_customers.toLocaleString()}
            subtitle="Distinct Customer IDs in data"
            icon={Users}
            color="emerald"
          />
          <KpiCard
            title="Average Order Value"
            value={`₹${kpis.average_order_value.toLocaleString('en-IN')}`}
            subtitle="Net Revenue / non-cancelled orders"
            icon={Calculator}
            color="violet"
          />
          <KpiCard
            title="Repeat Customer Rate"
            value={`${kpis.repeat_customer_rate}%`}
            subtitle="Customers with > 1 order (Bonus)"
            icon={UserCheck}
            color="cyan"
            badge="Bonus"
          />
        </div>

        {/* Grid Row 1: Monthly Trend + Status Breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ gridColumn: 'span 2' }}>
            <RevenueTrendChart data={monthlyTrend} />
          </div>
          <div>
            <OrderStatusChart data={orderStatusData} />
          </div>
        </div>

        {/* Grid Row 2: Category Revenue + Segment/City Breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.25rem'
        }}>
          <CategoryRevenueChart data={categoryData} />
          <SegmentCityChart data={segmentCityData} />
        </div>

        {/* Grid Row 3: Top 5 Best-Selling Products Leaderboard (Bonus) */}
        <div style={{ marginBottom: '2rem' }}>
          <TopProductsTable data={topProducts} />
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.25rem 1.75rem',
        backgroundColor: '#0c111d',
        color: 'var(--text-dim)',
        fontSize: '0.75rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem'
      }}>
        <div>
          <strong>Finance Assignment</strong> &bull; Python Full-Stack Sales Analytics Platform &bull; SQLite Relational Engine
        </div>
        <div>
          Enforces Business Logic: Cancelled Orders = ₹0 Net Revenue &bull; AOV = Revenue / Non-Cancelled Orders
        </div>
      </footer>
    </div>
  );
}
