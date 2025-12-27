import { Router } from 'express';
import { getAllEmployees, createEmployee } from '../controllers/employee.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getAllEmployees);
router.post('/', createEmployee);
export default router;