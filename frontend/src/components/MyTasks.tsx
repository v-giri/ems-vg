import { useGetCallerUserProfile, useGetTasksForEmployee, useUpdateTaskStatus } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

interface MyTasksProps {
  compact?: boolean;
}

export default function MyTasks({ compact = false }: MyTasksProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: tasks = [], isLoading } = useGetTasksForEmployee(userProfile?.employeeId ?? null);
  const updateStatus = useUpdateTaskStatus();

  const handleStatusChange = async (taskId: bigint, status: string) => {
    try {
      await updateStatus.mutateAsync({ taskId, status });
      toast.success('Task status updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const displayTasks = compact ? tasks.slice(0, 5) : tasks;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tasks</CardTitle>
        <CardDescription>View and update your assigned tasks</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
        ) : displayTasks.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <CheckSquare className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>No tasks assigned yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTasks.map((task) => (
                  <TableRow key={task.id.toString()}>
                    <TableCell className="max-w-xs">{task.description}</TableCell>
                    <TableCell>{task.deadline}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={task.status}
                        onValueChange={(value) => handleStatusChange(task.id, value)}
                        disabled={updateStatus.isPending}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
