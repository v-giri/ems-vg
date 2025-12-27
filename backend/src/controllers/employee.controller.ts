import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { jsonBigInt } from '../utils/helpers';
import bcrypt from 'bcryptjs'; // Make sure to import this

const prisma = new PrismaClient();

// Updated Schema: Now requires Email
const CreateEmployeeSchema = z.object({
  id: z.number().or(z.string()).transform(val => BigInt(val)),
  name: z.string().min(2),
  email: z.string().email(), // NEW FIELD
  position: z.string().min(2),
  department: z.string().min(2),
  salary: z.number().positive(),
  managerId: z.number().optional().nullable()
});

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    // Include the User relation to show their email if needed
    const employees = await prisma.employee.findMany({
      include: { user: { select: { email: true } } }
    });
    res.json(jsonBigInt(employees));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const data = CreateEmployeeSchema.parse(req.body);
    
    // Check if ID exists
    const existingEmp = await prisma.employee.findUnique({ where: { id: data.id } });
    if (existingEmp) return res.status(400).json({ error: 'Employee ID already exists' });

    // Check if Email exists
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) return res.status(400).json({ error: 'Email already used by another user' });

    // Default password for new employees
    const defaultPassword = await bcrypt.hash('welcome123', 10);

    // Use a Transaction to create Employee AND User together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Employee Profile
      const newEmployee = await tx.employee.create({
        data: {
          id: data.id,
          name: data.name,
          position: data.position,
          department: data.department,
          salary: data.salary,
          managerId: data.managerId ? BigInt(data.managerId) : null
        }
      });

      // 2. Create Login User Account linked to this Employee
      await tx.user.create({
        data: {
          email: data.email,
          password: defaultPassword,
          name: data.name,
          role: 'employee', // Default role
          employeeId: newEmployee.id
        }
      });

      return newEmployee;
    });
    
    res.json(jsonBigInt(result));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};