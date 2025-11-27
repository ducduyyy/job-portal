// src/services/AuthService.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

const AuthService = {
  login: async (username, password) => {
    const res = await axios.post(`${API_URL}/login`, { username, password });
    return res.data; // { token, role, user }
  },

  checkToken: async (token) => {
    const res = await axios.get(`${API_URL}/check-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // { success, user, role }
  },

  refreshToken: async (refreshToken) => {
    const res = await axios.post(`${API_URL}/refresh`, { refreshToken });
    return res.data; // { accessToken }
  },
  loginWithGoogle: async (credential) => {
    const res = await axios.post(`${API_URL}/google`, { credential });
    return res.data; // { accessToken, refreshToken, role, userId }
  },
  setRole: async (userId, role) => {
    const res = await axios.post(`${API_URL}/set-role`, {
      userId,
      role,
    });
    return res.data;
  },

};

export default AuthService;
