import axiosClient from '@/shared/api/axiosClient';

export const getUserProfile = () =>
  axiosClient.get('/user/profile');

export const updateProfile = (data) =>
  axiosClient.put('/user/profile', data);

export const getUserWorkouts = () =>
  axiosClient.get('/user/workouts');

export const getWorkoutById = (id) =>
  axiosClient.get(`/user/workouts/${id}`);

export const bookCoachAppointment = (data) =>
  axiosClient.post('/appointments', data);

export const getUserAppointments = (params) =>
  axiosClient.get('/appointments', { params });

export const updateAppointmentStatus = (id, data) =>
  axiosClient.patch(`/appointments/${id}/status`, data);

export const updateUserAppointment = (id, data) =>
  axiosClient.patch(`/appointments/${id}`, data);

export const getPublicCoaches = () =>
  axiosClient.get('/coach/public');

export const getPublicDietitians = () =>
  axiosClient.get('/dietitian/public');

export const bookDietitianAppointment = (data) =>
  axiosClient.post('/appointments', data);
