import { Router } from 'express';
import { getTasks, createTask, updateTaskStatus } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id/status', updateTaskStatus);
export default router;