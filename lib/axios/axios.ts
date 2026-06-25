import axios from 'axios';

// for proxy communication (next.js api)
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60s - maybe we wait response from upload picture
  headers: { 'Content-Type': 'application/json' },
});

// for backend nest.js communication
export const apiServer = axios.create({
  baseURL: process.env.NESTJS_API_URL || '',
  timeout: 60000, // 60s - maybe we wait response from upload picture
  headers: { 'Content-Type': 'application/json' },
  // Important: Helps Axios in node.js handle Set-Cookie arrays correctly
  withCredentials: true,
});

export default apiClient;