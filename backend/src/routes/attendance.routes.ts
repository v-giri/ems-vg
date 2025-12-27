import { Router } from 'express';
import { getAttendance, markAttendance } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/:employeeId', getAttendance);
router.post('/', markAttendance);
export default router;