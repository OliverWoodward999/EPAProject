// src/api.js
export const API_BASE =
  (import.meta?.env && import.meta.env.VITE_API_BASE) ||
  (window.location.hostname === 'localhost' ? 'http://localhost:5001' : '');

export const apiUrl = (p) => (API_BASE ? `${API_BASE}${p}` : p);
