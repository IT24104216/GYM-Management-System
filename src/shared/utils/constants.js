export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  COACH: 'coach',
  DIETITIAN: 'dietitian',
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  USER_DASHBOARD: '/user/dashboard',
  USER_WORKOUTS: '/user/workouts',
  USER_PROFILE: '/user/profile',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
  DIETITIAN_DASHBOARD: '/dietitian/dashboard',
  DIETITIAN_CLIENTS: '/dietitian/clients',
  DIETITIAN_MEAL_PLANS: '/dietitian/meal-plans',
  COACH_DASHBOARD: '/coach/dashboard',
  COACH_CLIENTS: '/coach/clients',
  COACH_WORKOUT_PLANS: '/coach/workout-plans',
};

export const ROLE_HOME = {
  [ROLES.USER]: ROUTES.USER_DASHBOARD,
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [ROLES.COACH]: ROUTES.COACH_DASHBOARD,
  [ROLES.DIETITIAN]: ROUTES.DIETITIAN_DASHBOARD,
};
