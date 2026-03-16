import axiosClient from './axiosClient';

export const taskApi = {
  getAll: (projectId, params) =>
    axiosClient.get(`/projects/${projectId}/tasks`, { params }),
  getById: (projectId, taskId) =>
    axiosClient.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId, data) =>
    axiosClient.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, taskId, data) =>
    axiosClient.put(`/projects/${projectId}/tasks/${taskId}`, data),
  updateStatus: (projectId, taskId, data) =>
    axiosClient.patch(`/projects/${projectId}/tasks/${taskId}/status`, data),
  delete: (projectId, taskId) =>
    axiosClient.delete(`/projects/${projectId}/tasks/${taskId}`),
};
