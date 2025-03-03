
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useSettings } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminSearchExams from "@/components/admin/AdminSearchExams";
import PendingExamsList from "@/components/admin/PendingExamsList";
import ManualExamForm from "@/components/admin/ManualExamForm";

const AdminDashboard = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { serpApiKey } = useSettings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("search");

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  if (currentUser?.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

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
