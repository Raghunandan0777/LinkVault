import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE, withCredentials: true });

// Inject Clerk token before each request
api.interceptors.request.use(async (config) => {
  try {
    // window.__clerk__ is set by ClerkProvider
    const token = await window.__clerk__?.session?.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err)
);

// ── Links ──────────────────────────────────────────────
export const getLinks = (params) => api.get('/links', { params });
export const getLink = (id) => api.get(`/links/${id}`);
export const createLink = (data) => api.post('/links', data);
export const updateLink = (id, data) => api.patch(`/links/${id}`, data);
export const deleteLink = (id) => api.delete(`/links/${id}`);
export const trackClick = (id, data) => api.post(`/links/${id}/click`, data);
export const enrichUrl = (url) => api.get('/links/enrich', { params: { url } });
export const getTags = () => api.get('/links/tags/all');
export const createTag = (data) => api.post('/links/tags/create', data);

// ── Collections ───────────────────────────────────────
export const getCollections = () => api.get('/collections');
export const getCollection = (id) => api.get(`/collections/${id}`);
export const createCollection = (data) => api.post('/collections', data);
export const updateCollection = (id, data) => api.patch(`/collections/${id}`, data);
export const deleteCollection = (id) => api.delete(`/collections/${id}`);

// ── Analytics ─────────────────────────────────────────
export const getAnalytics = (days = 30) => api.get('/analytics/overview', { params: { days } });

// ── Profile ───────────────────────────────────────────
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.patch('/profile', data);

// ── Public ────────────────────────────────────────────
export const getPublicProfile = (username) => api.get(`/public/${username}`);
export const getPublicCollection = (username, slug) => api.get(`/public/${username}/collections/${slug}`);

// ── Payment ───────────────────────────────────────────
export const createOrder = (plan) => api.post('/payment/order', { plan });
export const verifyPayment = (data) => api.post('/payment/verify', data);
export const getPaymentStatus = () => api.get('/payment/status');

export default api;
