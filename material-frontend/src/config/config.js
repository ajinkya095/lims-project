const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const config = {
  apiBaseUrl: BASE_URL ?? "http://192.168.3.45:7067",
  apiTimeoutMs: 15000,
};

export default config;
