import axiosClient from './axiosClient';

export const commentApi = {
  getByTask: (taskItemId) =>
    axiosClient.get(`/tasks/${taskItemId}/comments`),
  create: (taskItemId, data) =>
    axiosClient.post(`/tasks/${taskItemId}/comments`, data),
  delete: (taskItemId, commentId) =>
    axiosClient.delete(`/tasks/${taskItemId}/comments/${commentId}`),
};
