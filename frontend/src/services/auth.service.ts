import api from './api.config';
import type { LoginCredentials, AuthResponse, User } from '@/types';

export class AuthService {
  private static readonly AUTH_TOKEN_KEY = 'auth_token';

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('AuthService: Making login request');
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.log('AuthService: Login request successful');
      this.setToken(response.data.token);
      console.log('AuthService: Token stored');
      return response.data;
    } catch (error) {
      console.error('AuthService: Login request failed:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    console.log('AuthService: Making logout request');
    try {
      await api.post('/auth/logout');
      console.log('AuthService: Logout request successful');
    } catch (error) {
      console.error('AuthService: Logout request failed:', error);
      throw error;
    } finally {
      this.removeToken();
      console.log('AuthService: Token removed');
    }
  }

  static async getCurrentUser(): Promise<User> {
    console.log('AuthService: Fetching current user');
    try {
      const response = await api.get<User>('/auth/me');
      console.log('AuthService: Current user fetched successfully');
      return response.data;
    } catch (error) {
      console.error('AuthService: Failed to fetch current user:', error);
      throw error;
    }
  }

  static async updateProfilePicture(imageData: string): Promise<User> {
    console.log('AuthService: Updating profile picture');
    try {
      const response = await api.post<User>('/auth/profile-picture', { 
        profilePicture: imageData 
      });
      console.log('AuthService: Profile picture updated successfully');
      return response.data;
    } catch (error) {
      console.error('AuthService: Failed to update profile picture:', error);
      throw error;
    }
  }

  static getToken(): string | null {
    const token = localStorage.getItem(this.AUTH_TOKEN_KEY);
    console.log('AuthService: Getting token:', token ? 'Token exists' : 'No token found');
    return token;
  }

  static setToken(token: string): void {
    console.log('AuthService: Setting token');
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  static removeToken(): void {
    console.log('AuthService: Removing token');
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    const hasToken = !!this.getToken();
    console.log('AuthService: Checking authentication:', hasToken);
    return hasToken;
  }
} 