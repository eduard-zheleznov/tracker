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

  updateDecision: async (assessmentId, completed) => {
    const response = await api.patch(`/assessments/${assessmentId}/decision`, { completed });
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

// Analysis API
export const analysisAPI = {
  getStateRepetition: async (periodType = 'quarter', startDate = null, endDate = null) => {
    const response = await api.post('/analysis/state-repetition', {
      period_type: periodType,
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  },

  getHabitTrend: async (periodType = 'quarter', startDate = null, endDate = null) => {
    const response = await api.post('/analysis/habit-trend', {
      period_type: periodType,
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  },

  getHappinessTrend: async (periodType = 'quarter', startDate = null, endDate = null) => {
    const response = await api.post('/analysis/happiness-trend', {
      period_type: periodType,
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  },
};

// Strategy API
export const strategyAPI = {
  getDecisions: async (periodType = 'quarter', startDate = null, endDate = null, filterType = null) => {
    const response = await api.post(`/strategy/decisions${filterType ? `?filter_type=${filterType}` : ''}`, {
      period_type: periodType,
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  },

  getReflections: async (periodType = 'quarter', startDate = null, endDate = null) => {
    const response = await api.post('/strategy/reflections', {
      period_type: periodType,
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  get: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  },
};

// Reminders API
export const remindersAPI = {
  get: async () => {
    const response = await api.get('/reminders');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/reminders', data);
    return response.data;
  },
};

// FAQ API
export const faqAPI = {
  getAll: async () => {
    const response = await api.get('/faq');
    return response.data;
  },

  submitQuestion: async (question, topic = 'Общие') => {
    const response = await api.post('/questions', { question, topic });
    return response.data;
  },
};

// Feedback API
export const feedbackAPI = {
  submit: async (rating, suggestion) => {
    const response = await api.post('/feedback', { rating, suggestion });
    return response.data;
  },
};

// Education API
export const educationAPI = {
  getCategories: async () => {
    const response = await api.get('/education/categories');
    return response.data;
  },

  getCategoryVideos: async (categoryId) => {
    const response = await api.get(`/education/categories/${categoryId}/videos`);
    return response.data;
  },

  markVideoComplete: async (videoId) => {
    const response = await api.post(`/education/videos/${videoId}/complete`);
    return response.data;
  },
};

// Content API
export const contentAPI = {
  get: async (key) => {
    const response = await api.get(`/content/${key}`);
    return response.data;
  },
};

// Dictionary API
export const dictionaryAPI = {
  getAll: async () => {
    const response = await api.get('/dictionary');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // FAQ
  getFAQ: async () => {
    const response = await api.get('/admin/faq');
    return response.data;
  },
  createFAQ: async (data) => {
    const response = await api.post('/admin/faq', data);
    return response.data;
  },
  updateFAQ: async (id, data) => {
    const response = await api.put(`/admin/faq/${id}`, data);
    return response.data;
  },
  deleteFAQ: async (id) => {
    const response = await api.delete(`/admin/faq/${id}`);
    return response.data;
  },

  // Content
  getAllContent: async () => {
    const response = await api.get('/admin/content');
    return response.data;
  },
  updateContent: async (key, data) => {
    const response = await api.put(`/admin/content/${key}`, data);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/admin/education/categories');
    return response.data;
  },
  createCategory: async (data) => {
    const response = await api.post('/admin/education/categories', data);
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await api.put(`/admin/education/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/education/categories/${id}`);
    return response.data;
  },

  // Videos
  getVideos: async () => {
    const response = await api.get('/admin/education/videos');
    return response.data;
  },
  uploadVideo: async (formData) => {
    const response = await api.post('/admin/education/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateVideo: async (id, data) => {
    const response = await api.put(`/admin/education/videos/${id}`, data);
    return response.data;
  },
  toggleVideoBlock: async (id, blocked) => {
    const response = await api.patch(`/admin/education/videos/${id}/block?blocked=${blocked}`);
    return response.data;
  },
  deleteVideo: async (id) => {
    const response = await api.delete(`/admin/education/videos/${id}`);
    return response.data;
  },

  // Feedback
  getFeedback: async () => {
    const response = await api.get('/admin/feedback');
    return response.data;
  },

  // Setup admin
  setupAdmin: async () => {
    const response = await api.post('/admin/setup');
    return response.data;
  },
};

export default api;
