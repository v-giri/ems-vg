import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { jsonBigInt } from '../utils/helpers';

const prisma = new PrismaClient();
const LeaveSchema = z.object({
  employeeId: z.number().or(z.string()).transform(val => BigInt(val)),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string()
});

export const getAllLeaves = async (req: Request, res: Response) => {
  const { employeeId } = req.query;
  const where = employeeId ? { employeeId: BigInt(employeeId as string) } : {};
  const leaves = await prisma.leaveRequest.findMany({ where, include: { employee: true } });
  res.json(jsonBigInt(leaves));
};

export const requestLeave = async (req: Request, res: Response) => {
  try {
    const data = LeaveSchema.parse(req.body);
    const leave = await prisma.leaveRequest.create({
      data: { ...data, status: 'pending' }
    });
    res.json(jsonBigInt(leave));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const updateStatus = (status: string) => async (req: Request, res: Response) => {
  const leave = await prisma.leaveRequest.update({
    where: { id: BigInt(req.params.id) },
    data: { status }
  });
  res.json(jsonBigInt(leave));
};