import axios from "axios";

const configuredUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL;
export const apiConfigured = Boolean(configuredUrl);
const baseURL = configuredUrl?.replace(/\/api\/?$/, "");

const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 8000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "demo-session") config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
