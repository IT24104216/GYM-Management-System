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
  axiosClient.post('/user/appointments', data);
