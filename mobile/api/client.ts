import axios from 'axios';
import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to reach host machine
// Real devices use the machine's LAN IP
const API_URL = process.env.EXPO_PUBLIC_API_URL || Platform.select({
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api',
});

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = require('../store/auth').useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      require('../store/auth').useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default client;
