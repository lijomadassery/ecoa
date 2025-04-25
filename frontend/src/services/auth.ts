import axios from 'axios'
import { LoginCredentials, User } from '../types'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001/api'

export class AuthService {
  static async login(credentials: LoginCredentials) {
    const response = await axios.post(`${API_URL}/auth/login`, credentials)
    return response.data
  }

  static async logout() {
    await axios.post(`${API_URL}/auth/logout`)
  }

  static async validateToken(token: string) {
    const response = await axios.get(`${API_URL}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  }

  static async updateProfile(profileData: Partial<User>) {
    const response = await axios.patch(`${API_URL}/auth/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response.data
  }

  static async resetPassword(email: string) {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { email })
    return response.data
  }

  static async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await axios.post(`${API_URL}/auth/change-password`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    return response.data
  }
} 