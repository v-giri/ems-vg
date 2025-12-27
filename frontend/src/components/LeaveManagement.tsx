import { useGetAllLeaveRequests, useApproveLeaveRequest, useRejectLeaveRequest, useGetAllEmployeeProfiles } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface LeaveManagementProps {
  compact?: boolean;
}

export default function LeaveManagement({ compact = false }: LeaveManagementProps) {
  const { data: leaveRequests = [], isLoading } = useGetAllLeaveRequests();
  const { data: employees = [] } = useGetAllEmployeeProfiles();
  const approveLeave = useApproveLeaveRequest();
  const rejectLeave = useRejectLeaveRequest();

  const getEmployeeName = (employeeId: bigint) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee?.name || `Employee ${employeeId}`;
  };

  const handleApprove = async (leaveId: bigint) => {
    try {
      await approveLeave.mutateAsync(leaveId);
      toast.success('Leave request approved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve leave request');
    }
  };

  const handleReject = async (leaveId: bigint) => {
    try {
      await rejectLeave.mutateAsync(leaveId);
      toast.success('Leave request rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject leave request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const displayRequests = compact ? leaveRequests.slice(0, 5) : leaveRequests;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests</CardTitle>
        <CardDescription>Manage employee leave requests</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading leave requests...</div>
        ) : displayRequests.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <FileText className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>No leave requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRequests.map((request) => (
                  <TableRow key={request.id.toString()}>
                    <TableCell className="font-medium">{getEmployeeName(request.employeeId)}</TableCell>
                    <TableCell>{request.startDate}</TableCell>
                    <TableCell>{request.endDate}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      {request.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(request.id)}
                            disabled={approveLeave.isPending}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReject(request.id)}
                            disabled={rejectLeave.isPending}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
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
