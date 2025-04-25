import api from './api.config';
import type { User } from '@/types';

interface CreateUserDto {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  badgeNumber: string;
  role: string;
}

interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  badgeNumber?: string;
  role?: string;
}

export class AdminService {
  static async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async getUserById(id: number): Promise<User> {
    try {
      const response = await api.get<User>(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  static async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const response = await api.post<User>('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    try {
      const response = await api.put<User>(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  static async resetUserPassword(id: number, newPassword: string): Promise<void> {
    try {
      await api.post(`/admin/users/${id}/reset-password`, { password: newPassword });
    } catch (error) {
      console.error(`Error resetting password for user ${id}:`, error);
      throw error;
    }
  }

  static async updateUserStatus(id: number, status: 'active' | 'inactive'): Promise<User> {
    try {
      const response = await api.patch<User>(`/admin/users/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for user ${id}:`, error);
      throw error;
    }
  }

  static async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/admin/users/${id}`);
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
} 