import { useGetCallerUserProfile, useGetAllEmployeeProfiles, useGetAllLeaveRequests, useGetAttendanceRecordsForEmployee, useGetTasksForEmployee } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, IndianRupee, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  role: 'admin' | 'manager' | 'employee';
  onNavigate?: (tab: string) => void; // New Prop
}

export default function StatsCards({ role, onNavigate }: StatsCardsProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: employees = [] } = useGetAllEmployeeProfiles();
  const { data: allLeaveRequests = [] } = useGetAllLeaveRequests();
  const { data: myAttendance = [] } = useGetAttendanceRecordsForEmployee(userProfile?.employeeId ?? null);
  const { data: myTasks = [] } = useGetTasksForEmployee(userProfile?.employeeId ?? null);

  if (role === 'admin') {
    const pendingLeaves = allLeaveRequests.filter((req) => req.status === 'pending').length;
    const totalEmployees = employees.length;

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* CLICKABLE CARD: Switches to Employees Tab */}
        <Card 
          className="border-2 transition-all hover:shadow-lg cursor-pointer hover:border-primary/50"
          onClick={() => onNavigate?.('employees')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active workforce (Click to view)</p>
          </CardContent>
        </Card>

        <Card className="border-2 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-2 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-2 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Current</div>
            <p className="text-xs text-muted-foreground">Monthly processing</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Employee View (Unchanged logic, just keeping code structure)
  if (role === 'employee') {
     return (
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card className="border-2 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Payroll</div>
              <p className="text-xs text-muted-foreground">View payslips</p>
            </CardContent>
          </Card>
          {/* Add other employee cards here if needed */}
       </div>
     );
  }

  return null;
}