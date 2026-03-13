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
