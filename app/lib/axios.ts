// src/lib/axios.ts
import axios from 'axios';

// Ganti URL ini sesuai dengan backend Springboot kamu
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-kertas-kerja.zeabur.app/kertas-kerja/api/v2';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor response untuk handle error global (opsional)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle error umum disini jika perlu
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default apiClient;