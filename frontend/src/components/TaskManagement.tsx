import { useState } from 'react';
import { useGetAllTasks, useAssignTask, useGetAllEmployeeProfiles } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

interface TaskManagementProps {
  compact?: boolean;
}

export default function TaskManagement({ compact = false }: TaskManagementProps) {
  const { data: tasks = [], isLoading } = useGetAllTasks();
  const { data: employees = [] } = useGetAllEmployeeProfiles();
  const assignTask = useAssignTask();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    description: '',
    deadline: '',
    status: 'pending',
  });

  const resetForm = () => {
    setFormData({
      employeeId: '',
      description: '',
      deadline: '',
      status: 'pending',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // FIX: Removed BigInt wrappers. 
      // Passed 'assignedBy' as a string "1" (Assuming Admin ID 1).
      await assignTask.mutateAsync({
        employeeId: formData.employeeId,
        assignedBy: "1", 
        description: formData.description,
        status: formData.status,
        deadline: formData.deadline,
      });
      toast.success('Task assigned successfully');
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign task');
    }
  };

  const getEmployeeName = (employeeId: bigint) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee?.name || `Employee ${employeeId}`;
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Task Management</CardTitle>
            <CardDescription>Assign and track tasks</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Assign Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign New Task</DialogTitle>
                <DialogDescription>Create and assign a task to an employee</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Assign To</Label>
                  <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })} required>
                    <SelectTrigger id="employee">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id.toString()} value={emp.id.toString()}>
                          {emp.name} - {emp.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Task Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the task..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={assignTask.isPending}>
                    {assignTask.isPending ? 'Assigning...' : 'Assign Task'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
                  <TableHead>Employee</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTasks.map((task) => (
                  <TableRow key={task.id.toString()}>
                    <TableCell className="font-medium">{getEmployeeName(task.employeeId)}</TableCell>
                    <TableCell className="max-w-xs truncate">{task.description}</TableCell>
                    <TableCell>{task.deadline}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
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