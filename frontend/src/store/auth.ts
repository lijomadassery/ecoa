import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, AuthResponse } from '@/types'
import { AuthService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(AuthService.getToken())
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || '')

  // Actions
  const login = async (credentials: LoginCredentials) => {
    console.log('Auth store: login action started with:', { ...credentials, password: '***' });
    loading.value = true;
    try {
      const response = await AuthService.login(credentials)
      console.log('Auth store: received response from AuthService:', { ...response, token: '***' });
      setAuthData(response)
      console.log('Auth store: auth data set successfully');
      return response
    } catch (error) {
      console.error('Auth store: login error:', error);
      clearAuthData()
      throw error
    } finally {
      loading.value = false;
    }
  }

  const logout = async () => {
    console.log('Auth store: logout action started');
    loading.value = true;
    try {
      await AuthService.logout()
      console.log('Auth store: logout successful');
    } finally {
      clearAuthData()
      console.log('Auth store: auth data cleared');
      loading.value = false;
    }
  }

  const fetchCurrentUser = async () => {
    console.log('Auth store: fetching current user');
    if (!token.value) return null;
    
    loading.value = true;
    try {
      const userData = await AuthService.getCurrentUser();
      user.value = userData;
      console.log('Auth store: current user fetched successfully');
      return userData;
    } catch (error) {
      console.error('Auth store: error fetching current user:', error);
      clearAuthData();
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateProfilePicture = async (imageData: string) => {
    console.log('Auth store: updating profile picture');
    if (!user.value) return null;
    
    loading.value = true;
    try {
      const updatedUser = await AuthService.updateProfilePicture(imageData);
      user.value = updatedUser;
      console.log('Auth store: profile picture updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('Auth store: error updating profile picture:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Helper functions
  const setAuthData = (authData: AuthResponse) => {
    console.log('Auth store: setting auth data');
    user.value = authData.user
    token.value = authData.token
  }

  const clearAuthData = () => {
    console.log('Auth store: clearing auth data');
    user.value = null
    token.value = null
    AuthService.removeToken()
  }

  // Initialize auth state from token if exists
  const initializeAuth = async () => {
    console.log('Auth store: initializing auth state');
    const storedToken = AuthService.getToken()
    if (storedToken) {
      console.log('Auth store: found stored token');
      token.value = storedToken
      try {
        await fetchCurrentUser();
      } catch (error) {
        console.error('Auth store: initialization error:', error);
        clearAuthData()
      }
    }
  }

  return {
    // State
    user,
    token,
    loading,
    
    // Getters
    isAuthenticated,
    userRole,
    
    // Actions
    login,
    logout,
    fetchCurrentUser,
    updateProfilePicture,
    initializeAuth
  }
}) 