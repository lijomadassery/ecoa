import api from './api.config';

export interface PromptType {
  id: number;
  name: string;
  description: string;
  category: string;
}

export interface Prompt {
  id: number;
  userId: number;
  individualId: number;
  promptTypeId: number;
  status: string;
  notes?: string;
  location: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
  individual: {
    id: number;
    firstName: string;
    lastName: string;
    cdcrNumber: string;
  };
  promptType: PromptType;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    badgeNumber: string;
  };
}

export class PromptsService {
  static async getPromptTypes(): Promise<PromptType[]> {
    try {
      const response = await api.get<PromptType[]>('/prompt-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching prompt types:', error);
      throw error;
    }
  }

  static async getPrompts(): Promise<Prompt[]> {
    try {
      const response = await api.get<Prompt[]>('/prompts');
      return response.data;
    } catch (error) {
      console.error('Error fetching prompts:', error);
      throw error;
    }
  }

  static async createPrompt(data: {
    individualId: number;
    promptTypeId: number;
    status: string;
    notes?: string;
    location: string;
    deviceId: string;
  }): Promise<Prompt> {
    try {
      const response = await api.post<Prompt>('/prompts', data);
      return response.data;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  }

  static async updatePromptStatus(id: number, status: string, notes?: string): Promise<Prompt> {
    try {
      const response = await api.patch<Prompt>(`/prompts/${id}`, { status, notes });
      return response.data;
    } catch (error) {
      console.error('Error updating prompt status:', error);
      throw error;
    }
  }
} 