import axios from 'axios';
import { store } from '@/store';
import { logout as logoutAction, setRedirectAfterLogin } from '@/store/authSlice';

// Create axios instance with base configuration
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.churchapp.com/',
  headers: { 
    'Content-Type': 'application/json' 
  },
  // timeout: 10000,
});

// Request interceptor - Add auth token to all requests
httpClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle HTTP errors
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle different HTTP status codes
    const { status } = error.response;
    
    switch (status) {
      case 401:
        if (originalRequest?.skipAuthReset) {
          return Promise.reject(error);
        }
        // Token expired or invalid - redirect to login
        store.dispatch(
          setRedirectAfterLogin(window.location.pathname + window.location.search)
        );
        store.dispatch(logoutAction());
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please login again.'));
        
      case 403:
        return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
        
      case 404:
        return Promise.reject(new Error('The requested data was not found.'));
        
      case 422:
        // Validation errors - return the response data as-is
        return Promise.reject(error.response.data);
        
      case 500:
      case 502:
      case 503:
      case 504:
        return Promise.reject(new Error('Server error. Please try again later.'));
        
      default:
        // All HTTP error paths handled above; default covers any unhandled status codes.
        const errorMessage = error.response.data?.message || error.response.data?.error || 'An error occurred';
        return Promise.reject(new Error(errorMessage));
    }
  }
);

export default httpClient;
