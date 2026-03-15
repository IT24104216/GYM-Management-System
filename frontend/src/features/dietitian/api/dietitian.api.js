import axiosClient from '@/shared/api/axiosClient';

export const getDietitianClients = () =>
  axiosClient.get('/dietitian/clients');

export const getMealPlans = () =>
  axiosClient.get('/dietitian/meal-plans');

export const getMealPlanById = (id) =>
  axiosClient.get(`/dietitian/meal-plans/${id}`);

export const createMealPlan = (data) =>
  axiosClient.post('/dietitian/meal-plans', data);

export const updateMealPlan = (id, data) =>
  axiosClient.put(`/dietitian/meal-plans/${id}`, data);

export const deleteMealPlan = (id) =>
  axiosClient.delete(`/dietitian/meal-plans/${id}`);

export const getDietitianProfile = (dietitianId) =>
  axiosClient.get(`/dietitian/profile/${dietitianId}`);

export const upsertDietitianProfile = (dietitianId, data) =>
  axiosClient.put(`/dietitian/profile/${dietitianId}`, data);

export const deleteDietitianProfile = (dietitianId) =>
  axiosClient.delete(`/dietitian/profile/${dietitianId}`);

export const getPublicDietitians = () =>
  axiosClient.get('/dietitian/public');

export const getDietitianSchedulingSlots = (dietitianId) =>
  axiosClient.get(`/dietitian/scheduling/${dietitianId}`);

export const createDietitianSchedulingSlot = (dietitianId, data) =>
  axiosClient.post(`/dietitian/scheduling/${dietitianId}`, data);

export const updateDietitianSchedulingSlot = (dietitianId, slotId, data) =>
  axiosClient.put(`/dietitian/scheduling/${dietitianId}/${slotId}`, data);

export const deleteDietitianSchedulingSlot = (dietitianId, slotId) =>
  axiosClient.delete(`/dietitian/scheduling/${dietitianId}/${slotId}`);

export const getDietitianAppointments = (params) =>
  axiosClient.get('/appointments', { params });

export const updateDietitianAppointmentStatus = (id, data) =>
  axiosClient.patch(`/appointments/${id}/status`, data);
