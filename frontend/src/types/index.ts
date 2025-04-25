export interface User {
  id: number
  username: string
  firstName: string
  lastName: string
  badgeNumber: string
  role: string
  facilityId: number
  unitId?: number
  createdAt: string
  updatedAt: string
  profilePicture?: string
  status?: 'active' | 'inactive'
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  email?: string
  currentPassword?: string
  newPassword?: string
}

export interface Individual {
  id: string
  firstName: string
  lastName: string
  cdcrNumber: string
  housingUnit: string
  facilityId: string
  profilePicture?: string
  disabilities?: Disability[]
  createdAt: string
  updatedAt: string
}

export interface Disability {
  id: string
  type: string
  code: string
  description: string
} 