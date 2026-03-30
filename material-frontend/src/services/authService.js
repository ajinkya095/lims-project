import apiClient from "../api/axios";

const authService = {
  login: async (credentials) => {
    const response = await apiClient.post("/api/production/login", credentials);
    return response.data;
  },
};

export default authService;
