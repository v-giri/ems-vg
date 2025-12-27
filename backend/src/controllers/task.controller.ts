import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { jsonBigInt } from '../utils/helpers';

const prisma = new PrismaClient();
const TaskSchema = z.object({
  employeeId: z.number().or(z.string()).transform(val => BigInt(val)),
  assignedBy: z.number().or(z.string()).transform(val => BigInt(val)),
  description: z.string(),
  deadline: z.string(),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending')
});

export const getTasks = async (req: Request, res: Response) => {
  const { employeeId } = req.query;
  const where = employeeId ? { employeeId: BigInt(employeeId as string) } : {};
  const tasks = await prisma.task.findMany({ where, include: { employee: true } });
  res.json(jsonBigInt(tasks));
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const data = TaskSchema.parse(req.body);
    const task = await prisma.task.create({ data });
    res.json(jsonBigInt(task));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  const task = await prisma.task.update({
    where: { id: BigInt(req.params.id) },
    data: { status: req.body.status }
  });
  res.json(jsonBigInt(task));
};