import axiosClient from './axiosClient';

export const projectApi = {
  getAll: () => axiosClient.get('/projects'),
  getById: (id) => axiosClient.get(`/projects/${id}`),
  create: (data) => axiosClient.post('/projects', data),
  update: (id, data) => axiosClient.put(`/projects/${id}`, data),
  delete: (id) => axiosClient.delete(`/projects/${id}`),
};
