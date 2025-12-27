import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatsCards from '../components/StatsCards';
import MyAttendance from '../components/MyAttendance';
import MyLeaveRequests from '../components/MyLeaveRequests';
import MyTasks from '../components/MyTasks';
import MyPayroll from '../components/MyPayroll';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Calendar, FileText, DollarSign, CheckSquare } from 'lucide-react';

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout role="employee">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground">View your work information</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="leave" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Leave</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Payroll</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsCards role="employee" />
            <div className="grid gap-6 lg:grid-cols-2">
              <MyLeaveRequests compact />
              <MyTasks compact />
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <MyAttendance />
          </TabsContent>

          <TabsContent value="leave">
            <MyLeaveRequests />
          </TabsContent>

          <TabsContent value="payroll">
            <MyPayroll />
          </TabsContent>

          <TabsContent value="tasks">
            <MyTasks />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
