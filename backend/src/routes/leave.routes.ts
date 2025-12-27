import { Router } from 'express';
import { getAllLeaves, requestLeave, updateStatus } from '../controllers/leave.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getAllLeaves);
router.post('/', requestLeave);
router.patch('/:id/approve', updateStatus('approved'));
router.patch('/:id/reject', updateStatus('rejected'));
export default router;