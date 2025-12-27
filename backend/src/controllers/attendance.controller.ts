import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { jsonBigInt } from '../utils/helpers';

const prisma = new PrismaClient();
const AttendanceSchema = z.object({
  employeeId: z.number().or(z.string()).transform(val => BigInt(val)),
  date: z.string(),
  status: z.string()
});

export const getAttendance = async (req: Request, res: Response) => {
  const records = await prisma.attendance.findMany({
    where: { employeeId: BigInt(req.params.employeeId) },
    orderBy: { date: 'desc' }
  });
  res.json(jsonBigInt(records));
};

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const data = AttendanceSchema.parse(req.body);
    const record = await prisma.attendance.create({ data });
    res.json(jsonBigInt(record));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};