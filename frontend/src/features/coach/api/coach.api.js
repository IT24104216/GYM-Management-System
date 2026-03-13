import axiosClient from '@/shared/api/axiosClient';

export const getCoachClients = () =>
  axiosClient.get('/coach/clients');

export const getWorkoutPlans = () =>
  axiosClient.get('/coach/workout-plans');

export const getWorkoutPlanById = (id) =>
  axiosClient.get(`/coach/workout-plans/${id}`);

export const createWorkoutPlan = (data) =>
  axiosClient.post('/coach/workout-plans', data);

export const updateWorkoutPlan = (id, data) =>
  axiosClient.put(`/coach/workout-plans/${id}`, data);

export const deleteWorkoutPlan = (id) =>
  axiosClient.delete(`/coach/workout-plans/${id}`);
