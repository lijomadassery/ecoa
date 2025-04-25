import api from './api.config';

export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  detailedInfo?: {
    individual: {
      name: string;
      cdcrNumber: string;
    };
    promptType: string;
    category: string;
    status: string;
  };
}

export class ActivityService {
  static async getRecentActivity(limit: number = 10): Promise<ActivityLog[]> {
    try {
      const response = await api.get<ActivityLog[]>(`/activity/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }
} 