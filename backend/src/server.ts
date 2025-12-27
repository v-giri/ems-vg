import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

const prisma = new PrismaClient();
const app = express();

// --- 1. SECURITY MIDDLEWARE ---
app.use(helmet());
app.use(compression());

// Rate Limiting: Max 1000 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// CORS: Allow your Frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true
}));

app.use(express.json());

// --- 2. CONFIGURATION ---
const SECRET = process.env.JWT_SECRET || 'secret';

const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = jwt.verify(token, SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const jsonBigInt = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

// --- 3. ROUTES ---

// >>> AUTH ROUTES <<<
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  // Convert BigInt to String for JWT payload
  const token = jwt.sign(
    { 
      id: user.id, 
      role: user.role, 
      employeeId: user.employeeId ? user.employeeId.toString() : null 
    }, 
    SECRET, 
    { expiresIn: '8h' }
  );
  
  res.json({ token, user: jsonBigInt(user) });
});

// [NEW] Change Password Route
app.post('/api/auth/change-password', authenticate, async (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Incorrect current password' });

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

app.get('/api/auth/me', authenticate, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json(jsonBigInt(user));
});

// >>> EMPLOYEE ROUTES <<<
app.get('/api/employees', authenticate, async (req, res) => {
  try {
    const employees = await prisma.employee.findMany();
    res.json(jsonBigInt(employees));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.post('/api/employees', authenticate, async (req, res) => {
  const { id, name, email, position, department, salary, managerId } = req.body;
  try {
    const existing = await prisma.employee.findUnique({ where: { id: BigInt(id) } });
    if (existing) return res.status(400).json({ error: 'ID already exists' });

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Employee Profile
      const emp = await tx.employee.create({
        data: { 
          id: BigInt(id), name, position, department, 
          salary, managerId: managerId ? BigInt(managerId) : null 
        }
      });

      // 2. Create User Login (if email provided)
      if (email) {
        const hashedPassword = await bcrypt.hash('welcome123', 10);
        await tx.user.create({
          data: { 
            email, 
            password: hashedPassword, 
            name, 
            role: 'employee', 
            employeeId: emp.id 
          }
        });
      }
      return emp;
    });

    res.json(jsonBigInt(result));
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ error: 'Failed to create employee. Email or ID might be taken.' });
  }
});

app.put('/api/employees/:id', authenticate, async (req, res) => {
  const { name, position, department, salary, managerId } = req.body;
  try {
    const updatedEmp = await prisma.employee.update({
      where: { id: BigInt(req.params.id) },
      data: {
        name,
        position,
        department,
        salary,
        managerId: managerId ? BigInt(managerId) : null
      }
    });
    res.json(jsonBigInt(updatedEmp));
  } catch (e) {
    res.status(400).json({ error: 'Failed to update employee' });
  }
});

app.delete('/api/employees/:id', authenticate, async (req, res) => {
  const empId = BigInt(req.params.id);
  
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.deleteMany({ where: { employeeId: empId } });
      await tx.attendance.deleteMany({ where: { employeeId: empId } });
      await tx.leaveRequest.deleteMany({ where: { employeeId: empId } });
      await tx.payrollSlip.deleteMany({ where: { employeeId: empId } });
      await tx.task.deleteMany({ where: { employeeId: empId } });
      await tx.employee.updateMany({
        where: { managerId: empId },
        data: { managerId: null }
      });
      await tx.employee.delete({ where: { id: empId } });
    });

    res.json({ success: true });
  } catch (e: any) {
    console.error("Delete Error:", e);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// >>> ATTENDANCE ROUTES <<<
app.get('/api/attendance/:employeeId', authenticate, async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { employeeId: BigInt(req.params.employeeId) },
      orderBy: { date: 'desc' }
    });
    res.json(jsonBigInt(records));
  } catch (e) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/api/attendance', authenticate, async (req, res) => {
  const { employeeId, date, status } = req.body;
  try {
    const record = await prisma.attendance.create({
      data: { employeeId: BigInt(employeeId), date, status }
    });
    res.json(jsonBigInt(record));
  } catch (e) {
    res.status(400).json({ error: 'Failed to record attendance' });
  }
});

// >>> LEAVE ROUTES <<<
app.get('/api/leaves', authenticate, async (req, res) => {
  const { employeeId } = req.query;
  const where = employeeId ? { employeeId: BigInt(employeeId as string) } : {};
  const leaves = await prisma.leaveRequest.findMany({ 
    where, 
    include: { employee: true },
    orderBy: { startDate: 'desc' } 
  });
  res.json(jsonBigInt(leaves));
});

app.post('/api/leaves', authenticate, async (req, res) => {
  const { employeeId, startDate, endDate, reason } = req.body;
  try {
    const leave = await prisma.leaveRequest.create({
      data: { employeeId: BigInt(employeeId), startDate, endDate, reason, status: 'pending' }
    });
    res.json(jsonBigInt(leave));
  } catch (e) {
    res.status(400).json({ error: 'Failed to submit leave' });
  }
});

app.patch('/api/leaves/:id/:action', authenticate, async (req, res) => {
  const { id, action } = req.params;
  const status = action === 'approve' ? 'approved' : 'rejected';
  try {
    const leave = await prisma.leaveRequest.update({
      where: { id: BigInt(id) },
      data: { status }
    });
    res.json(jsonBigInt(leave));
  } catch (e) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// >>> PAYROLL ROUTES <<<
app.get('/api/payroll', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.query;
    const where = employeeId ? { employeeId: BigInt(employeeId as string) } : {};
    const payrolls = await prisma.payrollSlip.findMany({ 
      where, 
      include: { employee: true },
      orderBy: { date: 'desc' } 
    });
    res.json(jsonBigInt(payrolls));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch payroll' });
  }
});

app.post('/api/payroll', authenticate, async (req, res) => {
  const { employeeId, salary, deductions, bonuses, netPay, date } = req.body;
  try {
    const payroll = await prisma.payrollSlip.create({
      data: { employeeId: BigInt(employeeId), salary, deductions, bonuses, netPay, date }
    });
    res.json(jsonBigInt(payroll));
  } catch (e) {
    res.status(400).json({ error: 'Failed to generate payroll' });
  }
});

// >>> TASK ROUTES <<<
app.get('/api/tasks', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.query;
    const where = employeeId ? { employeeId: BigInt(employeeId as string) } : {};
    const tasks = await prisma.task.findMany({ 
      where, 
      include: { employee: true },
      orderBy: { deadline: 'asc' } 
    });
    res.json(jsonBigInt(tasks));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', authenticate, async (req, res) => {
  const { employeeId, assignedBy, description, deadline } = req.body;
  try {
    const task = await prisma.task.create({
      data: { 
        employeeId: BigInt(employeeId), 
        assignedBy: BigInt(assignedBy), 
        description, 
        deadline, 
        status: 'pending' 
      }
    });
    res.json(jsonBigInt(task));
  } catch (e) {
    res.status(400).json({ error: 'Failed to assign task' });
  }
});

app.patch('/api/tasks/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: BigInt(req.params.id) },
      data: { status }
    });
    res.json(jsonBigInt(task));
  } catch (e) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});