/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '@/features/auth/api/auth.api';
import { ROLES } from '@/shared/utils/constants';
import { getToken, getUser, setToken, setUser, clearAuth } from '@/shared/utils/storage';

const AuthContext = createContext(null);

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';
const STRICT_MOCK_PASSWORD = import.meta.env.VITE_MOCK_AUTH_STRICT_PASSWORD === 'true';
const MOCK_USERS_KEY = 'gympro_mock_users';

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const readMockUsers = () => {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveMockUsers = (users) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const inferRoleFromEmail = (email) => {
  if (email.includes('admin')) return ROLES.ADMIN;
  if (email.includes('coach')) return ROLES.COACH;
  if (email.includes('diet')) return ROLES.DIETITIAN;
  return ROLES.USER;
};

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate auth state from localStorage on mount
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    if (USE_MOCK_AUTH) {
      await wait(250);
      const email = normalizeEmail(credentials?.email);
      const password = credentials?.password || '';

      if (!email || !password) {
        throw new Error('Email and password are required.');
      }

      const users = readMockUsers();
      const savedUser = users.find((item) => item.email === email);

      // Keep UI flow unblocked by stale local mock passwords unless strict mode is requested.
      if (
        STRICT_MOCK_PASSWORD
        && savedUser
        && savedUser.password
        && savedUser.password !== password
      ) {
        throw new Error('Invalid email or password.');
      }

      const userData = {
        id: savedUser?.id || Date.now(),
        name: savedUser?.name || email.split('@')[0] || 'Member',
        email,
        role: savedUser?.role || inferRoleFromEmail(email),
      };
      const tokenData = `mock-token-${Date.now()}`;

      if (!savedUser) {
        users.push({ ...userData, password });
        saveMockUsers(users);
      }

      setToken(tokenData);
      setUser(userData);
      setTokenState(tokenData);
      setUserState(userData);
      return userData;
    }

    const { data } = await apiLogin(credentials);
    setToken(data.token);
    setUser(data.user);
    setTokenState(data.token);
    setUserState(data.user);
    return data.user;
  };

  const register = async (formData) => {
    if (USE_MOCK_AUTH) {
      await wait(300);
      const email = normalizeEmail(formData?.email);
      const password = formData?.password || '';

      if (!email || !password) {
        throw new Error('Email and password are required.');
      }

      const users = readMockUsers();
      const alreadyExists = users.some((item) => item.email === email);
      if (alreadyExists) {
        throw new Error('Account already exists. Please sign in.');
      }

      const userData = {
        id: Date.now(),
        name: (formData?.name || '').trim() || email.split('@')[0] || 'Member',
        email,
        role: formData?.role || inferRoleFromEmail(email),
      };
      const tokenData = `mock-token-${Date.now()}`;

      users.push({ ...userData, password });
      saveMockUsers(users);

      setToken(tokenData);
      setUser(userData);
      setTokenState(tokenData);
      setUserState(userData);
      return userData;
    }

    const { data } = await apiRegister(formData);
    setToken(data.token);
    setUser(data.user);
    setTokenState(data.token);
    setUserState(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      if (!USE_MOCK_AUTH) {
        await apiLogout();
      }
    } catch {
      // ignore errors on logout
    } finally {
      clearAuth();
      setTokenState(null);
      setUserState(null);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
