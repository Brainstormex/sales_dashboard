import axios from 'axios';

// Base URL points to FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchFilterOptions = async () => {
  const response = await apiClient.get('/api/filters');
  return response.data;
};

export const fetchKPIs = async (params = {}) => {
  const response = await apiClient.get('/api/kpis', { params });
  return response.data;
};

export const fetchMonthlyRevenue = async (params = {}) => {
  const response = await apiClient.get('/api/charts/monthly-revenue', { params });
  return response.data;
};

export const fetchCategoryRevenue = async (params = {}) => {
  const response = await apiClient.get('/api/charts/category-revenue', { params });
  return response.data;
};

export const fetchSegmentCityRevenue = async (params = {}) => {
  const response = await apiClient.get('/api/charts/segment-city', { params });
  return response.data;
};

export const fetchOrderStatusDistribution = async (params = {}) => {
  const response = await apiClient.get('/api/charts/order-status', { params });
  return response.data;
};

export const fetchTopProducts = async (params = {}) => {
  const response = await apiClient.get('/api/charts/top-products', { params });
  return response.data;
};

export const triggerDataReload = async () => {
  const response = await apiClient.post('/api/reload-data');
  return response.data;
};

export default apiClient;
