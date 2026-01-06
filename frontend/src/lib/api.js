import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (login, password, passwordHint) => {
    const response = await api.post('/auth/register', {
      login,
      password,
      password_hint: passwordHint,
    });
    return response.data;
  },

  login: async (login, password) => {
    const response = await api.post('/auth/login', {
      login,
      password,
    });
    return response.data;
  },

  getPasswordHint: async (login) => {
    const response = await api.post('/auth/password-hint', { login });
    return response.data;
  },

  resetPassword: async (login, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      login,
      new_password: newPassword,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Assessment API
export const assessmentAPI = {
  create: async (data) => {
    const response = await api.post('/assessments', {
      harmonious_states: data.harmoniousStates,
      disharmonious_states: data.disharmoniousStates,
      reflection: data.reflection,
      decision_type: data.decisionType,
      decision_text: data.decisionText,
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/assessments');
    return response.data;
  },
};

// Happiness Score API
export const happinessAPI = {
  getScore: async (periodType = 'quarter', startDate = null, endDate = null) => {
    const response = await api.post('/happiness-score', {
      period_type: periodType,
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  },
};

export default api;
