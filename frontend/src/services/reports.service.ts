import api from './api.config';

export interface PromptCompletionStats {
  totalPrompts: number;
  completedPrompts: number;
  pendingPrompts: number;
  refusedPrompts: number;
  completionRate: number;
  byDate: {
    date: string;
    completed: number;
    pending: number;
    refused: number;
  }[];
}

export interface IndividualActivityStats {
  cdcrNumber: string;
  firstName: string;
  lastName: string;
  totalPrompts: number;
  completionRate: number;
  lastPromptDate: string;
  promptsByType: {
    type: string;
    count: number;
    completionRate: number;
  }[];
}

export interface StaffPerformanceStats {
  userId: number;
  firstName: string;
  lastName: string;
  badgeNumber: string;
  totalPrompts: number;
  completedPrompts: number;
  averageResponseTime: number;
  promptsByStatus: {
    status: string;
    count: number;
  }[];
}

export class ReportsService {
  static async getPromptCompletionStats(
    startDate: string,
    endDate: string,
    facilityId?: number
  ): Promise<PromptCompletionStats> {
    try {
      const response = await api.get<PromptCompletionStats>('/reports/prompt-completion', {
        params: { startDate, endDate, facilityId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching prompt completion stats:', error);
      throw error;
    }
  }

  static async getIndividualActivityStats(
    startDate: string,
    endDate: string,
    facilityId?: number
  ): Promise<IndividualActivityStats[]> {
    try {
      const response = await api.get<IndividualActivityStats[]>('/reports/individual-activity', {
        params: { startDate, endDate, facilityId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching individual activity stats:', error);
      throw error;
    }
  }

  static async getStaffPerformanceStats(
    startDate: string,
    endDate: string,
    facilityId?: number
  ): Promise<StaffPerformanceStats[]> {
    try {
      const response = await api.get<StaffPerformanceStats[]>('/reports/staff-performance', {
        params: { startDate, endDate, facilityId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching staff performance stats:', error);
      throw error;
    }
  }
} 