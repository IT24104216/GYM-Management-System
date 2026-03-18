import axiosClient from './axiosClient';

export const getUserNotifications = (params) =>
  axiosClient.get('/notifications/list', { params });

export const markNotificationAsRead = (id, payload) =>
  axiosClient.patch(`/notifications/${id}/read`, payload);

export const markAllNotificationsAsRead = (payload) =>
  axiosClient.patch('/notifications/read-all', payload);
