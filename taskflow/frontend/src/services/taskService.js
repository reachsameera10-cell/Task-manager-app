import { api } from '../lib/api';

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined || value === false) {
      return;
    }

    query.append(key, String(value));
  });

  const search = query.toString();
  return search ? `?${search}` : '';
};

export const taskService = {
  getTasks: (params = {}) => api.get(`/tasks${buildQueryString(params)}`),
  getStats: () => api.get('/tasks/stats'),
  createTask: (payload) => api.post('/tasks', payload),
  updateTask: (id, payload) => api.put(`/tasks/${id}`, payload),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};
