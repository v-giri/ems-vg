import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatsCards from '../components/StatsCards';
import LeaveManagement from '../components/LeaveManagement';
import TaskManagement from '../components/TaskManagement';
import AttendanceManagement from '../components/AttendanceManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Calendar, FileText, CheckSquare } from 'lucide-react';

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground">Manage your team effectively</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
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
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsCards role="manager" />
            <div className="grid gap-6 lg:grid-cols-2">
              <LeaveManagement compact />
              <TaskManagement compact />
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceManagement />
          </TabsContent>

          <TabsContent value="leave">
            <LeaveManagement />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
