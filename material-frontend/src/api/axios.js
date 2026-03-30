import axios from "axios";
import config from "../config/config";

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeoutMs,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((requestConfig) => {
  const token = localStorage.getItem("token");

  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }

  return requestConfig;
});

export default apiClient;
