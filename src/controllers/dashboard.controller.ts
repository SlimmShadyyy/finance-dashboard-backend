import {Response} from 'express';
import {AuthRequest} from '../middlewares/auth';
import {getDashboardSummary} from '../services/dashboard.service';

export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const summary = await getDashboardSummary(req.user.id);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};