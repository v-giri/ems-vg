import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { jsonBigInt } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET!;

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, employeeId: user.employeeId },
      SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user: jsonBigInt(user) });
  } catch (e) {
    res.status(400).json({ error: 'Invalid request' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json(jsonBigInt(user));
};