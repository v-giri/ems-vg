import { useState } from 'react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Building2, LogOut, User, Key } from 'lucide-react';
import { toast } from 'sonner';
import ChangePasswordDialog from './ChangePasswordDialog'; // Ensure you have this component created

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'manager' | 'employee';
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    queryClient.clear();
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'admin':
        return 'bg-destructive/10 text-destructive';
      case 'manager':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-accent/10 text-accent-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Change Password Dialog */}
      <ChangePasswordDialog 
        open={isPasswordDialogOpen} 
        onOpenChange={setIsPasswordDialogOpen} 
      />

      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">EMS</h1>
              <p className="text-xs text-muted-foreground">Employee Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden rounded-full px-3 py-1 text-xs font-medium sm:block ${getRoleBadgeColor()}`}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full p-0 overflow-hidden h-10 w-10">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userProfile ? getInitials(userProfile.name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userProfile?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)} className="cursor-pointer">
                  <Key className="mr-2 h-4 w-4" />
                  <span>Change Password</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © 2025 Employee Management System. | Vivek Giri
          </p>
        </div>
      </footer>
    </div>
  );
}