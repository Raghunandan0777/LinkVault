import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE, withCredentials: true });

let currentGetToken = null;

export const setTokenFetcher = (fetcher) => {
  currentGetToken = fetcher;
};

// Inject Clerk token before each request
api.interceptors.request.use(async (config) => {
  try {
    if (currentGetToken) {
      const token = await currentGetToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback
      const token = await window.Clerk?.session?.getToken() || await window.__clerk__?.session?.getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
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
export const importBookmarks = (html) => api.post('/links/import', { html });
export const exportLinks = (format = 'json') => api.get(`/links/export?format=${format}`, { responseType: format === 'csv' ? 'blob' : 'json' });
export const aiSearch = (query) => api.post('/links/search/ai', { query });
export const enrichUrl = (url) => api.get('/links/enrich', { params: { url } });
export const getTags = () => api.get('/links/tags/all');
export const createTag = (data) => api.post('/links/tags/create', data);

// ── Collections ───────────────────────────────────────
export const getCollections = () => api.get('/collections');
export const getCollection = (id) => api.get(`/collections/${id}`);
export const createCollection = (data) => api.post('/collections', data);
export const updateCollection = (id, data) => api.patch(`/collections/${id}`, data);
export const deleteCollection = (id) => api.delete(`/collections/${id}`);
export const reorderCollectionLinks = (id, items) => api.patch(`/collections/${id}/reorder`, { items });

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

// ── Teams ─────────────────────────────────────────────
export const getTeams = () => api.get('/teams');
export const createTeam = (data) => api.post('/teams', data);
export const deleteTeam = (id) => api.delete(`/teams/${id}`);
export const inviteTeamMember = (teamId, data) => api.post(`/teams/${teamId}/invite`, data);
export const getTeamMembers = (teamId) => api.get(`/teams/${teamId}/members`);
export const removeTeamMember = (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`);
export const getTeamCollections = (teamId) => api.get(`/teams/${teamId}/collections`);
export const shareCollectionWithTeam = (teamId, collectionId) => api.post(`/teams/${teamId}/collections/${collectionId}`);

export default api;
