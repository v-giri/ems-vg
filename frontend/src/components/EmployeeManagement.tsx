import { useState } from 'react';
import { useGetAllEmployeeProfiles, useAddEmployeeProfile, useUpdateEmployeeProfile, useDeleteEmployeeProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { EmployeeProfile } from '../hooks/useQueries';

export default function EmployeeManagement() {
  const { data: employees = [], isLoading } = useGetAllEmployeeProfiles();
  const addEmployee = useAddEmployeeProfile();
  const updateEmployee = useUpdateEmployeeProfile();
  const deleteEmployee = useDeleteEmployeeProfile();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // UPDATED: Included email field
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '', // <--- NEW
    position: '',
    department: '',
    salary: '',
    managerId: '',
  });

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      position: '',
      department: '',
      salary: '',
      managerId: '',
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addEmployee.mutateAsync({
        id: BigInt(formData.id),
        name: formData.name,
        email: formData.email, // <--- Sent to backend to create User
        position: formData.position,
        department: formData.department,
        salary: parseFloat(formData.salary),
        managerId: formData.managerId ? BigInt(formData.managerId) : undefined,
      });
      toast.success('Employee added successfully (Login created)');
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add employee');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      await updateEmployee.mutateAsync({
        id: selectedEmployee.id,
        name: formData.name,
        position: formData.position,
        department: formData.department,
        salary: parseFloat(formData.salary),
        managerId: formData.managerId ? BigInt(formData.managerId) : undefined,
      });
      toast.success('Employee updated successfully');
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update employee');
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;

    try {
      await deleteEmployee.mutateAsync(selectedEmployee.id);
      toast.success('Employee deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete employee');
    }
  };

  const openEditDialog = (employee: EmployeeProfile) => {
    setSelectedEmployee(employee);
    setFormData({
      id: employee.id.toString(),
      name: employee.name,
      email: '', // Emails are not typically editable here
      position: employee.position,
      department: employee.department,
      salary: employee.salary.toString(),
      managerId: employee.managerId?.toString() || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: EmployeeProfile) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>Add, edit, and manage employee records</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter details. <strong>A login account will be auto-created</strong> with the password <code>welcome123</code>.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-id">Employee ID</Label>
                  <Input
                    id="add-id"
                    type="number"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-name">Full Name</Label>
                  <Input
                    id="add-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                {/* --- NEW EMAIL INPUT --- */}
                <div className="space-y-2">
                  <Label htmlFor="add-email">Email (Login Username)</Label>
                  <Input
                    id="add-email"
                    type="email"
                    placeholder="employee@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {/* ----------------------- */}

                <div className="space-y-2">
                  <Label htmlFor="add-position">Position</Label>
                  <Input
                    id="add-position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-department">Department</Label>
                  <Input
                    id="add-department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-salary">Salary (INR)</Label>
                  <Input
                    id="add-salary"
                    type="number"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-manager">Manager ID (Optional)</Label>
                  <Input
                    id="add-manager"
                    type="number"
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addEmployee.isPending}>
                    {addEmployee.isPending ? 'Adding...' : 'Add Employee'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {searchTerm ? 'No employees found matching your search' : 'No employees added yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id.toString()}>
                    <TableCell className="font-medium">{employee.id.toString()}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.department}</Badge>
                    </TableCell>
                    <TableCell>₹{employee.salary.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(employee)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(employee)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-position">Position</Label>
              <Input
                id="edit-position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-salary">Salary</Label>
              <Input
                id="edit-salary"
                type="number"
                step="0.01"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-manager">Manager ID (Optional)</Label>
              <Input
                id="edit-manager"
                type="number"
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateEmployee.isPending}>
                {updateEmployee.isPending ? 'Updating...' : 'Update Employee'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedEmployee?.name}'s record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteEmployee.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}