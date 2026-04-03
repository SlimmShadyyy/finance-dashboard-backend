import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { PrismaClient } from '.prisma/client';

const prisma = new PrismaClient();

export const createRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const { amount, type, category, notes } = req.body;
    
    const record = await prisma.record.create({
      data: {
        amount,
        type,
        category,
        notes,
        userId: req.user.id
      }
    });
    
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create record' });
  }
};

export const getRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { type, category, startDate, endDate } = req.query;
    
    const queryFilters: any = { userId: req.user.id };
    
    // Exact match filters
    if (type) queryFilters.type = String(type);
    if (category) queryFilters.category = String(category);
    
    // Date range filters
    if (startDate || endDate) {
      queryFilters.date = {};
      if (startDate) queryFilters.date.gte = new Date(String(startDate));
      if (endDate) queryFilters.date.lte = new Date(String(endDate));
    }

    const records = await prisma.record.findMany({
      where: queryFilters,
      orderBy: { date: 'desc' }
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch records' });
  }
};

export const updateRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { amount, type, category, notes } = req.body;

    const existingRecord = await prisma.record.findUnique({ where: { id } });
    if (!existingRecord || existingRecord.userId !== req.user?.id) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    const updatedRecord = await prisma.record.update({
      where: { id },
      data: { amount, type, category, notes }
    });

    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update record' });
  }
};

export const deleteRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id); 

    const existingRecord = await prisma.record.findUnique({ where: { id } });
    if (!existingRecord || existingRecord.userId !== req.user?.id) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    await prisma.record.delete({ where: { id } });
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
};

