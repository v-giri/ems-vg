import { Router } from 'express';
import { getPayroll, createPayroll } from '../controllers/payroll.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getPayroll);
router.post('/', createPayroll);
export default router;