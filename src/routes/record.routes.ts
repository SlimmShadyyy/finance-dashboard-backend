import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';
import { CreateRecordSchema } from '../schemas/record.schema';
import * as DashboardController from '../controllers/dashboard.controller';
import * as RecordController from '../controllers/record.controller';

const router = Router();

router.get('/summary', 
  authenticate, 
  requireRole(['VIEWER', 'ANALYST', 'ADMIN']), 
  DashboardController.getSummary
);

router.post('/', 
  authenticate, 
  requireRole(['ADMIN']), 
  validateRequest(CreateRecordSchema), 
  RecordController.createRecord
);

router.get('/', 
  authenticate, 
  requireRole(['ANALYST', 'ADMIN']), 
  RecordController.getRecords
);

router.put('/:id', 
  authenticate, 
  requireRole(['ADMIN']), 
  validateRequest(CreateRecordSchema), 
  RecordController.updateRecord
);

router.delete('/:id', 
  authenticate, 
  requireRole(['ADMIN']), 
  RecordController.deleteRecord
);

export default router;