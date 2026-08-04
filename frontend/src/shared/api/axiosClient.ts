import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Token-ready architecture for future authentication support
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Normalize successful responses and error models
axiosClient.interceptors.response.use(
  (response) => {
    // The server wraps responses in { success: boolean, data: any, message?: string }
    // We return response.data directly so callers get the full payload
    return response.data;
  },
  (error) => {
    // Normalizes error structure to a standard shape: { code: string, message: string, details?: any }
    const normalizedError = {
      code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
      message: error.response?.data?.error?.message || error.message || 'An unexpected error occurred.',
      details: error.response?.data?.error?.details || null,
      status: error.response?.status || 500,
    };

    // If unauthorized (401), we could trigger token refresh or logout in future auth system
    if (normalizedError.status === 401) {
      // Future logout callback or event dispatch can be placed here
    }

    return Promise.reject(normalizedError);
  }
);
