import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// --- Types ---
export interface UserProfile {
  name: string;
  role: 'admin' | 'manager' | 'employee';
  employeeId?: bigint | string;
}

export interface EmployeeProfile {
  id: bigint | string;
  name: string;
  position: string;
  department: string;
  salary: number;
  managerId?: bigint | string;
}

export interface AttendanceRecord {
  id: bigint | string;
  employeeId: bigint | string;
  date: string;
  status: string;
}

export interface LeaveRequest {
  id: bigint | string;
  employeeId: bigint | string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PayrollSlip {
  id: bigint | string;
  employeeId: bigint | string;
  salary: number;
  deductions: number;
  bonuses: number;
  netPay: number;
  date: string;
}

export interface Task {
  id: bigint | string;
  employeeId: bigint | string;
  assignedBy: bigint | string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  deadline: string;
}

// --- Axios Setup ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- User Queries ---
export function useGetCallerUserProfile() {
  return useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/auth/me');
        return data;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });
}

// [NEW] Change Password Mutation
export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return api.post('/auth/change-password', data);
    },
  });
}

// --- Employee Queries ---
export function useGetAllEmployeeProfiles() {
  return useQuery<EmployeeProfile[]>({
    queryKey: ['employeeProfiles'],
    queryFn: async () => {
      const { data } = await api.get('/employees');
      return data;
    },
  });
}

export function useGetEmployeeProfile(id: bigint | string | null) {
  return useQuery<EmployeeProfile | null>({
    queryKey: ['employeeProfile', id?.toString()],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get(`/employees/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useAddEmployeeProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: any) => {
      const payload = {
        ...profile,
        id: profile.id.toString(),
        managerId: profile.managerId ? profile.managerId.toString() : null
      };
      return api.post('/employees', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeProfiles'] });
    },
  });
}

export function useUpdateEmployeeProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: EmployeeProfile) => {
      const payload = {
        ...profile,
        id: profile.id.toString(),
        managerId: profile.managerId ? profile.managerId.toString() : null
      };
      return api.put(`/employees/${profile.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeProfiles'] });
    },
  });
}

export function useDeleteEmployeeProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint | string) => {
      return api.delete(`/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeProfiles'] });
    },
  });
}

// --- Attendance Queries ---
export function useGetAttendanceRecordsForEmployee(employeeId: bigint | string | null) {
  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendanceRecords', employeeId?.toString()],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data } = await api.get(`/attendance/${employeeId}`);
      return data;
    },
    enabled: !!employeeId,
  });
}

export function useAddAttendanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: any) => {
      const payload = { ...record, employeeId: record.employeeId.toString() };
      return api.post('/attendance', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords', variables.employeeId.toString()] });
    },
  });
}

// --- Leave Queries ---
export function useGetLeaveRequestsForEmployee(employeeId: bigint | string | null) {
  return useQuery<LeaveRequest[]>({
    queryKey: ['leaveRequests', employeeId?.toString()],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data } = await api.get(`/leaves?employeeId=${employeeId}`);
      return data;
    },
    enabled: !!employeeId,
  });
}

export function useGetAllLeaveRequests() {
  return useQuery<LeaveRequest[]>({
    queryKey: ['allLeaveRequests'],
    queryFn: async () => {
      const { data } = await api.get('/leaves');
      return data;
    },
  });
}

export function useSubmitLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: any) => {
      const payload = { ...request, employeeId: request.employeeId.toString() };
      return api.post('/leaves', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allLeaveRequests'] });
    },
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leaveId: bigint | string) => {
      return api.patch(`/leaves/${leaveId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leaveId: bigint | string) => {
      return api.patch(`/leaves/${leaveId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
  });
}

// --- Payroll Queries ---
export function useGetPayrollSlipsForEmployee(employeeId: bigint | string | null) {
  return useQuery<PayrollSlip[]>({
    queryKey: ['payrollSlips', employeeId?.toString()],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data } = await api.get(`/payroll?employeeId=${employeeId}`);
      return data;
    },
    enabled: !!employeeId,
  });
}

export function useGetAllPayrollSlips() {
  return useQuery<PayrollSlip[]>({
    queryKey: ['allPayrollSlips'],
    queryFn: async () => {
      const { data } = await api.get('/payroll');
      return data;
    },
  });
}

export function useAddPayrollSlip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slip: any) => {
      const payload = { ...slip, employeeId: slip.employeeId.toString() };
      return api.post('/payroll', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollSlips'] });
      queryClient.invalidateQueries({ queryKey: ['allPayrollSlips'] });
    },
  });
}

// --- Task Queries ---
export function useGetTasksForEmployee(employeeId: bigint | string | null) {
  return useQuery<Task[]>({
    queryKey: ['tasks', employeeId?.toString()],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data } = await api.get(`/tasks?employeeId=${employeeId}`);
      return data;
    },
    enabled: !!employeeId,
  });
}

export function useGetAllTasks() {
  return useQuery<Task[]>({
    queryKey: ['allTasks'],
    queryFn: async () => {
      const { data } = await api.get('/tasks');
      return data;
    },
  });
}

export function useAssignTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: any) => {
      const payload = {
        ...task,
        employeeId: task.employeeId.toString(),
        assignedBy: task.assignedBy.toString()
      };
      return api.post('/tasks', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: bigint | string; status: string }) => {
      return api.patch(`/tasks/${taskId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
    },
  });
}