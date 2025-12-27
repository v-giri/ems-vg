import { useState } from 'react';
import { useGetAllEmployeeProfiles, useAddAttendanceRecord, useGetAttendanceRecordsForEmployee } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendanceManagement() {
  const { data: employees = [] } = useGetAllEmployeeProfiles();
  const addAttendance = useAddAttendanceRecord();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [viewEmployeeId, setViewEmployeeId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('present');

  const { data: attendanceRecords = [] } = useGetAttendanceRecordsForEmployee(
    viewEmployeeId ? BigInt(viewEmployeeId) : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    try {
      // FIX: Removed "id" and removed "BigInt()" wrapper.
      // We pass the ID as a string. The backend will handle the conversion.
      await addAttendance.mutateAsync({
        employeeId: selectedEmployeeId, 
        date,
        status,
      });
      
      toast.success('Attendance recorded successfully');
      setIsDialogOpen(false);
      setSelectedEmployeeId('');
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('present');
    } catch (error: any) {
      toast.error(error.message || 'Failed to record attendance');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Present</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'leave':
        return <Badge variant="secondary">On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Attendance Management</CardTitle>
            <CardDescription>Record and track employee attendance</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Attendance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Attendance</DialogTitle>
                <DialogDescription>Mark attendance for an employee</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId} required>
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
                  <Label htmlFor="date">Date</Label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus} required>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addAttendance.isPending}>
                    {addAttendance.isPending ? 'Recording...' : 'Record Attendance'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="view-employee">View Attendance For</Label>
          <Select value={viewEmployeeId} onValueChange={setViewEmployeeId}>
            <SelectTrigger id="view-employee">
              <SelectValue placeholder="Select employee to view attendance" />
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

        {viewEmployeeId ? (
          attendanceRecords.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id.toString()}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>Select an employee to view their attendance records</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}