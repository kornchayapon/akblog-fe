import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { authStore } from '@/modules/front/auth/stores/auth-store';

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}

// Instance for refresh only to avoid loops and other interceptors
const refreshClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// for proxy communication (next.js api)
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60s - maybe we wait response from upload picture
  headers: { 'Content-Type': 'application/json' },
});

// config apiClient to token attached
apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

// process request queue
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) =>
    error ? promise.reject(error) : promise.resolve(token),
  );
  failedQueue = [];
};

// config apiClient for refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle only 401 errors and void infinite retry loops
    // Also skip refresh logic for signin request to let the actual error pass through
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.endsWith('/auth/signin')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err: unknown) => Promise.reject(err));
      }

      // isRefreshing == false, not in refresh token process
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // User refreshClient instead of the main axios instance
        const { data } = await refreshClient.post('/auth/refresh');
        const { access_token } = data;

        authStore.getState().setAccessToken(access_token);

        // process queue ...
        processQueue(null, access_token);

        console.log('[axios]: process queue ...');
        

        // process current request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshTokenError: unknown) {
        processQueue(refreshTokenError, null);
        authStore.getState().clearAuth();
        return Promise.reject(refreshTokenError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// for backend nest.js communication
export const apiServer = axios.create({
  baseURL: process.env.NESTJS_API_URL || '',
  timeout: 60000, // 60s - maybe we wait response from upload picture
  headers: { 'Content-Type': 'application/json' },
  // Important: Helps Axios in node.js handle Set-Cookie arrays correctly
  withCredentials: true,
});

export default apiClient;
