
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/stores/auth-store";
import { useSettings } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminSearchExams from "@/components/admin/AdminSearchExams";
import PendingExamsList from "@/components/admin/PendingExamsList";
import ManualExamForm from "@/components/admin/ManualExamForm";
import { checkSupabaseConnection } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Crown, Database, ShieldAlert } from "lucide-react";

const AdminDashboard = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { serpApiKey } = useSettings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("search");
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      if (!isAuthenticated) {
        toast.error("Please sign in to access the admin dashboard");
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      if (currentUser?.role !== "admin") {
        toast.error("You don't have admin privileges to access this page");
        navigate("/dashboard");
        return;
      }

      console.log("Admin authentication verified:", currentUser);

      // Check database connection
      const { connected, error } = await checkSupabaseConnection();
      setDbConnected(connected);
      
      if (!connected) {
        console.error("Database connection error:", error);
        toast.error("Could not connect to the database. Some features may not work.");
      } else {
        console.log("Database connection established");
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [isAuthenticated, currentUser, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Show loading until we've checked authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading admin dashboard...</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // If not admin, show access denied
  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <ShieldAlert className="h-12 w-12 text-destructive" />
              <h2 className="text-xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground text-center">
                You don't have admin privileges to access this page.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage exams and application content
              </p>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-md">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Admin Account</span>
            </div>
          </div>
          
          {dbConnected === false && (
            <Card className="bg-destructive/10 border-destructive mb-6">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">Database connection error</p>
                    <p className="text-sm text-muted-foreground">
                      Could not connect to the database. Some features may not work properly.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.location.reload()}
                    >
                      Retry Connection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Tabs defaultValue="search" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="search">Search New Exams</TabsTrigger>
              <TabsTrigger value="manual">Add Manually</TabsTrigger>
              <TabsTrigger value="pending">Pending Exams</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-6">
              {serpApiKey ? (
                <AdminSearchExams serpApiKey={serpApiKey} />
              ) : (
                <Card>
                  <CardContent className="py-8 flex flex-col items-center gap-4">
                    <AlertCircle className="h-12 w-12 text-amber-500" />
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-medium">API Key Missing</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        To search for exams, you need to add a SerpAPI key in the Settings page.
                      </p>
                      <Button onClick={() => navigate('/settings')} className="mt-4">
                        Go to Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-6">
              <ManualExamForm />
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-6">
              <PendingExamsList />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
