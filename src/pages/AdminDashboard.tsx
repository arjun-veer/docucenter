
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useSettings } from "@/lib/store";
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

const AdminDashboard = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { serpApiKey } = useSettings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("search");
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (currentUser?.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    // Check database connection
    const checkConnection = async () => {
      const { connected, error } = await checkSupabaseConnection();
      setDbConnected(connected);
      
      if (!connected) {
        console.error("Database connection error:", error);
        toast.error("Could not connect to the database. Some features may not work.");
      }
    };
    
    checkConnection();
  }, [isAuthenticated, currentUser, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Show loading until we've checked authentication
  if (dbConnected === null) {
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage exams and application content
            </p>
          </div>
          
          {dbConnected === false && (
            <Card className="bg-destructive/10 border-destructive mb-6">
              <CardContent className="py-4">
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-destructive">Database connection error</p>
                  <p className="text-sm text-muted-foreground">
                    Could not connect to the database. Some features may not work properly.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 self-start"
                    onClick={() => window.location.reload()}
                  >
                    Retry Connection
                  </Button>
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
              <AdminSearchExams serpApiKey={serpApiKey} />
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
