// src/stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => !!user.value);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      loading.value = true;
      const response = await axios.get('/auth/profile');
      user.value = response.data;
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      user.value = null;
    } finally {
      loading.value = false;
    }
  };

  const login = async (email, password) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await axios.post('/auth/login', { email, password });
      const { access_token, refresh_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      user.value = userData;
      
      return { success: true, user: userData };
    } catch (err) {
      error.value = err.message || 'Error al iniciar sesión';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      user.value = null;
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    loadUser,
    login,
    logout,
  };
});