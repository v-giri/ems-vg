import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatsCards from '../components/StatsCards';
import EmployeeManagement from '../components/EmployeeManagement';
import AttendanceManagement from '../components/AttendanceManagement';
import LeaveManagement from '../components/LeaveManagement';
import PayrollManagement from '../components/PayrollManagement';
import TaskManagement from '../components/TaskManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// FIXED: Imported IndianRupee instead of DollarSign
import { Users, Calendar, FileText, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your organization's workforce</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Employees</span>
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
              {/* FIXED: Using IndianRupee icon */}
              <IndianRupee className="h-4 w-4" />
              <span className="hidden sm:inline">Payroll</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* ENABLED NAVIGATION: Passing setActiveTab to handle card clicks */}
            <StatsCards role="admin" onNavigate={setActiveTab} />
            <div className="grid gap-6 lg:grid-cols-2">
              <LeaveManagement compact />
              <TaskManagement compact />
            </div>
          </TabsContent>

          <TabsContent value="employees">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceManagement />
          </TabsContent>

          <TabsContent value="leave">
            <LeaveManagement />
          </TabsContent>

          <TabsContent value="payroll">
            <PayrollManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}