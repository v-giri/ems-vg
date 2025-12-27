import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import LandingPage from './pages/LandingPage';

function DashboardHandler() {
  const { data: userProfile, isLoading, isError } = useGetCallerUserProfile();

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (isError || !userProfile) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  switch (userProfile.role) {
    case 'admin': return <AdminDashboard />;
    case 'manager': return <ManagerDashboard />;
    default: return <EmployeeDashboard />;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardHandler />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}