import api from './api.config';
import type { User } from '@/types';

export class RosterService {
  static async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  }

  static async getUser(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  }

  static async createUser(userData: Partial<User>): Promise<User> {
    const response = await api.post<User>('/users', userData);
    return response.data;
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, userData);
    return response.data;
  }

  static async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }
} 