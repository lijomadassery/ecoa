import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getCommunicationNotes = async (req: Request, res: Response) => {
  try {
    const { individualId, category, status, searchTerm } = req.query;
    
    const where: any = {};
    
    if (individualId) {
      where.individualId = parseInt(individualId as string, 10);
    }
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm as string } },
        { content: { contains: searchTerm as string } },
      ];
    }
    
    const notes = await prisma.communicationNote.findMany({
      where,
      include: {
        individual: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    const formattedNotes = notes.map(note => ({
      ...note,
      individualName: `${note.individual.firstName} ${note.individual.lastName}`,
      createdByName: `${note.createdBy.firstName} ${note.createdBy.lastName}`,
    }));
    
    res.json(formattedNotes);
  } catch (error) {
    console.error('Error fetching communication notes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCommunicationNoteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const note = await prisma.communicationNote.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        individual: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Communication note not found' });
    }
    
    const formattedNote = {
      ...note,
      individualName: `${note.individual.firstName} ${note.individual.lastName}`,
      createdByName: `${note.createdBy.firstName} ${note.createdBy.lastName}`,
    };
    
    res.json(formattedNote);
  } catch (error) {
    console.error(`Error fetching communication note by ID: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCommunicationNote = async (req: Request, res: Response) => {
  try {
    const { title, content, category, tags, priority, individualId, attachments } = req.body;
    
    // Get user ID from authentication
    const userId = (req as any).user.id;
    
    // Get facility ID from individual
    const individual = await prisma.individual.findUnique({
      where: { id: individualId },
      select: { facilityId: true },
    });
    
    if (!individual) {
      return res.status(404).json({ message: 'Individual not found' });
    }
    
    const newNote = await prisma.communicationNote.create({
      data: {
        title,
        content,
        category,
        tags,
        priority: priority || 0,
        status: 'ACTIVE',
        attachments,
        individualId,
        createdById: userId,
        facilityId: individual.facilityId,
        // If available, add unit ID as well
      },
      include: {
        individual: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
    const formattedNote = {
      ...newNote,
      individualName: `${newNote.individual.firstName} ${newNote.individual.lastName}`,
      createdByName: `${newNote.createdBy.firstName} ${newNote.createdBy.lastName}`,
    };
    
    res.status(201).json(formattedNote);
  } catch (error) {
    console.error(`Error creating communication note: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCommunicationNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, priority, status, attachments } = req.body;
    
    // Get user ID from authentication
    const userId = (req as any).user.id;
    
    // Check if note exists
    const existingNote = await prisma.communicationNote.findUnique({
      where: { id: parseInt(id, 10) },
    });
    
    if (!existingNote) {
      return res.status(404).json({ message: 'Communication note not found' });
    }
    
    const updatedNote = await prisma.communicationNote.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        content,
        category,
        tags,
        priority,
        status,
        attachments,
        updatedById: userId,
      },
      include: {
        individual: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
    const formattedNote = {
      ...updatedNote,
      individualName: `${updatedNote.individual.firstName} ${updatedNote.individual.lastName}`,
      createdByName: `${updatedNote.createdBy.firstName} ${updatedNote.createdBy.lastName}`,
    };
    
    res.json(formattedNote);
  } catch (error) {
    console.error(`Error updating communication note: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCommunicationNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if note exists
    const existingNote = await prisma.communicationNote.findUnique({
      where: { id: parseInt(id, 10) },
    });
    
    if (!existingNote) {
      return res.status(404).json({ message: 'Communication note not found' });
    }
    
    await prisma.communicationNote.delete({
      where: { id: parseInt(id, 10) },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting communication note: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCommunicationNoteCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.communicationNote.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });
    
    const categoryList = categories.map(c => c.category);
    
    // If no categories found, return default ones
    if (categoryList.length === 0) {
      return res.json(['Communication', 'Medical', 'Housing', 'Programs', 'Legal', 'Other']);
    }
    
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching communication note categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 