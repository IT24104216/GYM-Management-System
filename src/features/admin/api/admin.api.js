import axiosClient from '@/shared/api/axiosClient';

export const getAllUsers = (params) =>
  axiosClient.get('/admin/users', { params });

export const getUserById = (id) =>
  axiosClient.get(`/admin/users/${id}`);

export const updateUser = (id, data) =>
  axiosClient.put(`/admin/users/${id}`, data);

export const deleteUser = (id) =>
  axiosClient.delete(`/admin/users/${id}`);

export const getPlatformStats = () =>
  axiosClient.get('/admin/stats');
