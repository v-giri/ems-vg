import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { jsonBigInt } from '../utils/helpers';

const prisma = new PrismaClient();
const PayrollSchema = z.object({
  employeeId: z.number().or(z.string()).transform(val => BigInt(val)),
  salary: z.number(),
  deductions: z.number(),
  bonuses: z.number(),
  netPay: z.number(),
  date: z.string()
});

export const getPayroll = async (req: Request, res: Response) => {
  const { employeeId } = req.query;
  const where = employeeId ? { employeeId: BigInt(employeeId as string) } : {};
  const items = await prisma.payrollSlip.findMany({ where, include: { employee: true } });
  res.json(jsonBigInt(items));
};

export const createPayroll = async (req: Request, res: Response) => {
  try {
    const data = PayrollSchema.parse(req.body);
    const item = await prisma.payrollSlip.create({ data });
    res.json(jsonBigInt(item));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};