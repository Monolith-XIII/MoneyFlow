import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor com debug
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  console.log('🚀 Request Interceptor:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    token: token ? token.substring(0, 20) + '...' : 'NO TOKEN'
  });
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 Token adicionado aos headers');
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response Success:', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 401 Unauthorized - limpando auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);