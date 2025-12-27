import { useState } from 'react';
import { useGetAllPayrollSlips, useAddPayrollSlip, useGetAllEmployeeProfiles } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

export default function PayrollManagement() {
  const { data: payrollSlips = [], isLoading } = useGetAllPayrollSlips();
  const { data: employees = [] } = useGetAllEmployeeProfiles();
  const addPayroll = useAddPayrollSlip();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    salary: '',
    deductions: '',
    bonuses: '',
    date: new Date().toISOString().split('T')[0],
  });

  const resetForm = () => {
    setFormData({
      employeeId: '',
      salary: '',
      deductions: '',
      bonuses: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const salary = parseFloat(formData.salary);
    const deductions = parseFloat(formData.deductions);
    const bonuses = parseFloat(formData.bonuses);
    const netPay = salary - deductions + bonuses;

    try {
      // FIX: Removed "id" and removed BigInt wrappers.
      // Passing employeeId as a string.
      await addPayroll.mutateAsync({
        employeeId: formData.employeeId,
        salary,
        deductions,
        bonuses,
        netPay,
        date: formData.date,
      });
      toast.success('Payroll slip generated successfully');
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate payroll slip');
    }
  };

  const getEmployeeName = (employeeId: bigint) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee?.name || `Employee ${employeeId}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Payroll Management</CardTitle>
            <CardDescription>Generate and manage employee payroll</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Generate Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Payroll Slip</DialogTitle>
                <DialogDescription>Create a new payroll slip for an employee</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) => {
                      const employee = employees.find((emp) => emp.id.toString() === value);
                      setFormData({
                        ...formData,
                        employeeId: value,
                        salary: employee?.salary.toString() || '',
                      });
                    }}
                    required
                  >
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
                  <Label htmlFor="salary">Base Salary (INR)</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductions">Deductions (INR)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    step="0.01"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonuses">Bonuses (INR)</Label>
                  <Input
                    id="bonuses"
                    type="number"
                    step="0.01"
                    value={formData.bonuses}
                    onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">
                    Net Pay: ₹
                    {(
                      parseFloat(formData.salary || '0') -
                      parseFloat(formData.deductions || '0') +
                      parseFloat(formData.bonuses || '0')
                    ).toFixed(2)}
                  </p>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addPayroll.isPending}>
                    {addPayroll.isPending ? 'Generating...' : 'Generate Payroll'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading payroll slips...</div>
        ) : payrollSlips.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <IndianRupee className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>No payroll slips generated yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Bonuses</TableHead>
                  <TableHead>Net Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollSlips.map((slip) => (
                  <TableRow key={slip.id.toString()}>
                    <TableCell className="font-medium">{getEmployeeName(slip.employeeId)}</TableCell>
                    <TableCell>{slip.date}</TableCell>
                    <TableCell>₹{slip.salary.toLocaleString()}</TableCell>
                    <TableCell className="text-destructive">-₹{slip.deductions.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">+₹{slip.bonuses.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">₹{slip.netPay.toLocaleString()}</TableCell>
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