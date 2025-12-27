import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  CheckSquare, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  BarChart3 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* --- Navigation --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Building2 className="h-6 w-6" />
            <span>Employee Management System</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* --- Hero Section --- */}
        <section className="relative overflow-hidden py-24 md:py-32 lg:py-40 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-primary">
                The Smart Way to Manage <br className="hidden sm:inline" />
                Your Workforce
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                Streamline attendance, payroll, leaves, and tasks in one unified platform. 
                Designed for modern teams who value efficiency and transparency.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link to="/login">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-lg gap-2">
                    Start Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- Stats Section --- 
         <section className="border-y bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">100+</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Companies</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">50k+</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Employees</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">99.9%</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Uptime</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">24/7</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Support</p>
              </div>
            </div>
          </div>
        </section> */}

        {/* --- Features Grid (Everything You Need) --- */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything You Need</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                EMS provide a comprehensive suite of tools to handle every aspect of employee management.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Users className="h-10 w-10 text-blue-600" />}
                title="Employee Profiles"
                description="Centralized database for personal details, roles, and hierarchy management."
              />
              <FeatureCard 
                icon={<Clock className="h-10 w-10 text-green-600" />}
                title="Attendance Tracking"
                description="Real-time attendance marking with detailed logs and daily status reports."
              />
              <FeatureCard 
                icon={<DollarSign className="h-10 w-10 text-yellow-600" />}
                title="Payroll Management"
                description="Automated salary calculation with deductions, bonuses, and payslip generation."
              />
              <FeatureCard 
                icon={<CheckSquare className="h-10 w-10 text-purple-600" />}
                title="Task Assignment"
                description="Assign, monitor, and complete tasks efficiently within teams and departments."
              />
              <FeatureCard 
                icon={<ShieldCheck className="h-10 w-10 text-red-600" />}
                title="Role-Based Security"
                description="Secure access controls for Admins and Employees."
              />
              <FeatureCard 
                icon={<BarChart3 className="h-10 w-10 text-indigo-600" />}
                title="Insightful Analytics"
                description="Dashboard overviews for quick decision making and workforce analysis."
              />
            </div>
          </div>
        </section>

      </main>

      {/* --- Footer --- */}
      <footer className="border-t py-12 bg-gray-50 dark:bg-gray-900">
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2025 Employee Management System. | Vivek Giri
          </div>
      </footer>
    </div>
  );
}

// Helper Component for Features
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="mb-4 bg-muted/50 w-fit p-3 rounded-xl">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}