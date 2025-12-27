# Employee Management System

## Overview
A comprehensive employee management system with role-based access control for managing employees, attendance, payroll, leaves, and tasks.

## User Roles and Authentication
- **Authentication**: Internet Identity integration for secure login
- **Admin**: Full system access - manage all employees, attendance, payroll, leaves, and tasks
- **Manager**: Team management - view and manage their team's attendance, leave requests, and task assignments
- **Employee**: Self-service - view profile, attendance record, payroll slips, and submit leave requests

## Core Features

### Employee Records Management
- Add, edit, delete employee profiles
- Search and filter employees
- Store employee information including personal details, job role, department, and manager assignment

### Attendance Tracking
- Daily attendance recording system
- View attendance records per employee
- Generate attendance reports and statistics
- Calculate attendance rates

### Leave Management
- Employee leave request submission
- Manager approval/rejection workflow
- Leave balance tracking
- Leave history and status viewing

### Payroll Processing
- Automated salary calculations based on attendance, leave days, and configured allowances/deductions
- Monthly payroll generation
- Downloadable payroll slips for employees
- Payroll summaries and reports

### Task Management
- Managers can assign tasks to team members
- Employees can view assigned tasks and update progress status
- Task tracking and completion monitoring

### Role-Based Dashboards
- **Admin Dashboard**: Total employees, overall attendance rates, pending leave requests, payroll overview
- **Manager Dashboard**: Team attendance, team leave requests, assigned tasks status
- **Employee Dashboard**: Personal attendance, leave balance, assigned tasks, recent payroll

## Technical Requirements
- Fully responsive design using Tailwind CSS
- Clean, modern, mobile-friendly interface
- English language content

## Backend Data Storage
The backend must store and manage:
- Employee profiles and personal information
- Daily attendance records
- Leave requests and approval status
- Payroll data including salary calculations and deductions
- Task assignments and progress tracking
- User role assignments and permissions
