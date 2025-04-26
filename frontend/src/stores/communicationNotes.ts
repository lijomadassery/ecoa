import { defineStore } from 'pinia';
import communicationNotesService, { 
  CommunicationNote,
  CommunicationNoteCreateInput,
  CommunicationNoteUpdateInput,
  CommunicationNoteFilter
} from '@/services/communication-notes.service';

interface CommunicationNotesState {
  notes: CommunicationNote[];
  filteredNotes: CommunicationNote[];
  selectedNote: CommunicationNote | null;
  isLoading: boolean;
  error: string | null;
  categories: string[];
  filters: CommunicationNoteFilter;
}

export const useCommunicationNotesStore = defineStore('communicationNotes', {
  state: (): CommunicationNotesState => ({
    notes: [],
    filteredNotes: [],
    selectedNote: null,
    isLoading: false,
    error: null,
    categories: [],
    filters: {}
  }),

  getters: {
    getNoteById: (state) => (id: number) => {
      return state.notes.find(note => note.id === id) || null;
    },
    
    getNotesForIndividual: (state) => (individualId: number) => {
      return state.notes.filter(note => note.individualId === individualId);
    },
    
    getNotesByCategory: (state) => (category: string) => {
      return state.notes.filter(note => note.category === category);
    },
    
    activeNotes: (state) => {
      return state.notes.filter(note => note.status === 'ACTIVE');
    }
  },

  actions: {
    async fetchNotes(filters: CommunicationNoteFilter = {}) {
      this.isLoading = true;
      this.error = null;
      this.filters = { ...this.filters, ...filters };
      
      try {
        const notes = await communicationNotesService.getCommunicationNotes(this.filters);
        this.notes = notes;
        this.filteredNotes = notes;
      } catch (error) {
        this.error = 'Failed to fetch communication notes';
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchNoteById(id: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const note = await communicationNotesService.getCommunicationNoteById(id);
        if (note) {
          this.selectedNote = note;
          
          // Update in notes array if exists
          const index = this.notes.findIndex(n => n.id === id);
          if (index !== -1) {
            this.notes[index] = note;
          } else {
            this.notes.push(note);
          }
        }
      } catch (error) {
        this.error = `Failed to fetch communication note with ID ${id}`;
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },

    async createNote(noteData: CommunicationNoteCreateInput) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const newNote = await communicationNotesService.createCommunicationNote(noteData);
        if (newNote) {
          this.notes.push(newNote);
          this.filteredNotes = [...this.notes];
          return newNote;
        }
        return null;
      } catch (error) {
        this.error = 'Failed to create communication note';
        console.error(error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async updateNote(noteData: CommunicationNoteUpdateInput) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const updatedNote = await communicationNotesService.updateCommunicationNote(noteData);
        if (updatedNote) {
          const index = this.notes.findIndex(note => note.id === updatedNote.id);
          if (index !== -1) {
            this.notes[index] = updatedNote;
            this.filteredNotes = [...this.notes];
          }
          
          if (this.selectedNote && this.selectedNote.id === updatedNote.id) {
            this.selectedNote = updatedNote;
          }
          
          return updatedNote;
        }
        return null;
      } catch (error) {
        this.error = `Failed to update communication note with ID ${noteData.id}`;
        console.error(error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteNote(id: number) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const success = await communicationNotesService.deleteCommunicationNote(id);
        if (success) {
          this.notes = this.notes.filter(note => note.id !== id);
          this.filteredNotes = this.filteredNotes.filter(note => note.id !== id);
          
          if (this.selectedNote && this.selectedNote.id === id) {
            this.selectedNote = null;
          }
          
          return true;
        }
        return false;
      } catch (error) {
        this.error = `Failed to delete communication note with ID ${id}`;
        console.error(error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCategories() {
      try {
        this.categories = await communicationNotesService.getCommunicationNoteCategories();
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Set default categories
        this.categories = ['Communication', 'Medical', 'Housing', 'Programs', 'Legal', 'Other'];
      }
    },

    setFilter(filter: CommunicationNoteFilter) {
      this.filters = { ...this.filters, ...filter };
      this.applyFilters();
    },

    clearFilters() {
      this.filters = {};
      this.filteredNotes = [...this.notes];
    },

    applyFilters() {
      let result = [...this.notes];
      
      if (this.filters.individualId) {
        result = result.filter(note => note.individualId === this.filters.individualId);
      }
      
      if (this.filters.category) {
        result = result.filter(note => note.category === this.filters.category);
      }
      
      if (this.filters.status) {
        result = result.filter(note => note.status === this.filters.status);
      }
      
      if (this.filters.searchTerm) {
        const searchTerm = this.filters.searchTerm.toLowerCase();
        result = result.filter(note => 
          note.title.toLowerCase().includes(searchTerm) || 
          note.content.toLowerCase().includes(searchTerm) ||
          (note.individualName && note.individualName.toLowerCase().includes(searchTerm))
        );
      }
      
      this.filteredNotes = result;
    },

    selectNote(note: CommunicationNote | null) {
      this.selectedNote = note;
    }
  }
}); 