
import axios from 'axios';

// Base URLs for Microservices
export const USERS_API = 'http://localhost:3001/api';
export const ORDERS_API = 'http://localhost:3002/api';
export const PAYMENTS_API = 'http://localhost:3003/api';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
