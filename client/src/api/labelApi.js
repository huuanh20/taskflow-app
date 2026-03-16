import axiosClient from './axiosClient';

export const labelApi = {
  getAll: () => axiosClient.get('/labels'),
  create: (data) => axiosClient.post('/labels', data),
};
