import api from './api.config';

export interface CommunicationNote {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  priority: number;
  status: string;
  individualId: number;
  createdAt: string;
  updatedAt: string;
  individualName?: string;
  createdByName?: string;
}

export interface CommunicationNoteCreateInput {
  title: string;
  content: string;
  category: string;
  tags: string[];
  priority: number;
  individualId: number;
  attachments: any[];
}

export interface CommunicationNoteUpdateInput {
  id: number;
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  priority?: number;
  status?: string;
  attachments?: any[];
}

export interface CommunicationNoteFilter {
  individualId?: number;
  category?: string;
  status?: string;
  searchTerm?: string;
}

const communicationNotesService = {
  async getCommunicationNotes(filters: CommunicationNoteFilter = {}): Promise<CommunicationNote[]> {
    try {
      const response = await api.get('/communication-notes', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching communication notes:', error);
      return [];
    }
  },

  async getCommunicationNoteById(id: number): Promise<CommunicationNote | null> {
    try {
      const response = await api.get(`/communication-notes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching communication note with id ${id}:`, error);
      return null;
    }
  },

  async createCommunicationNote(note: CommunicationNoteCreateInput): Promise<CommunicationNote | null> {
    try {
      const response = await api.post('/communication-notes', note);
      return response.data;
    } catch (error) {
      console.error('Error creating communication note:', error);
      return null;
    }
  },

  async updateCommunicationNote(note: CommunicationNoteUpdateInput): Promise<CommunicationNote | null> {
    try {
      const response = await api.put(`/communication-notes/${note.id}`, note);
      return response.data;
    } catch (error) {
      console.error(`Error updating communication note with id ${note.id}:`, error);
      return null;
    }
  },

  async deleteCommunicationNote(id: number): Promise<boolean> {
    try {
      await api.delete(`/communication-notes/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting communication note with id ${id}:`, error);
      return false;
    }
  },

  async getCommunicationNoteCategories(): Promise<string[]> {
    try {
      const response = await api.get('/communication-notes/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching communication note categories:', error);
      return ['Communication', 'Medical', 'Housing', 'Programs', 'Legal', 'Other'];
    }
  }
};

export default communicationNotesService; 