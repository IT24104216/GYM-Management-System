import axiosClient from '@/shared/api/axiosClient';

export const getUserProfile = () =>
  axiosClient.get('/user/profile');

export const updateProfile = (data) =>
  axiosClient.put('/user/profile', data);

export const getUserWorkouts = () =>
  axiosClient.get('/user/workouts');

export const getWorkoutById = (id) =>
  axiosClient.get(`/user/workouts/${id}`);

export const getUserWorkoutPlans = (userId, options = {}) =>
  axiosClient.get('/workouts/plans', {
    params: {
      userId,
      ...(options?.submitted !== undefined ? { submitted: options.submitted } : {}),
    },
  });

export const startUserWorkoutSession = (planId, data) =>
  axiosClient.post(`/workouts/plans/${planId}/session/start`, data);

export const updateUserWorkoutSessionProgress = (planId, data) =>
  axiosClient.patch(`/workouts/plans/${planId}/session/progress`, data);

export const finishUserWorkoutSession = (planId, data) =>
  axiosClient.patch(`/workouts/plans/${planId}/session/finish`, data);

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

export const getUserProgress = (userId) =>
  axiosClient.get(`/progress/${userId}`);

export const saveUserMeasurement = (userId, data) =>
  axiosClient.put(`/progress/${userId}/measurements`, data);
