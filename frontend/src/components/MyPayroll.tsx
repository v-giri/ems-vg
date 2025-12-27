import { useGetCallerUserProfile, useGetPayrollSlipsForEmployee } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { IndianRupee, Download } from 'lucide-react'; // CHANGED ICON

export default function MyPayroll() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: payrollSlips = [], isLoading } = useGetPayrollSlipsForEmployee(userProfile?.employeeId ?? null);

  const handleDownload = (slip: any) => {
    // CHANGED: $ to ₹ in text download
    const content = `
PAYROLL SLIP
Date: ${slip.date}
Employee ID: ${slip.employeeId}

Base Salary: ₹${slip.salary.toFixed(2)}
Deductions: -₹${slip.deductions.toFixed(2)}
Bonuses: +₹${slip.bonuses.toFixed(2)}
-----------------------------------
Net Pay: ₹${slip.netPay.toFixed(2)}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${slip.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Payroll</CardTitle>
        <CardDescription>View and download your payroll slips</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading payroll...</div>
        ) : payrollSlips.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
             {/* CHANGED: DollarSign to IndianRupee */}
            <IndianRupee className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>No payroll slips available yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Bonuses</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollSlips.map((slip) => (
                  <TableRow key={slip.id.toString()}>
                    <TableCell>{slip.date}</TableCell>
                    {/* CHANGED: $ to ₹ */}
                    <TableCell>₹{slip.salary.toLocaleString()}</TableCell>
                    <TableCell className="text-destructive">-₹{slip.deductions.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">+₹{slip.bonuses.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">₹{slip.netPay.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(slip)}>
                        <Download className="h-4 w-4" />
                      </Button>
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