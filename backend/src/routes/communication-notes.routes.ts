import { Router } from 'express';
import {
  getCommunicationNotes,
  getCommunicationNoteById,
  createCommunicationNote,
  updateCommunicationNote,
  deleteCommunicationNote,
  getCommunicationNoteCategories
} from '../controllers/communication-notes.controller';

const router = Router();

// Get all communication notes (with filters)
router.get('/', getCommunicationNotes);

// Get communication note categories
router.get('/categories', getCommunicationNoteCategories);

// Get communication note by ID
router.get('/:id', getCommunicationNoteById);

// Create new communication note
router.post('/', createCommunicationNote);

// Update communication note
router.put('/:id', updateCommunicationNote);

// Delete communication note
router.delete('/:id', deleteCommunicationNote);

export default router; 