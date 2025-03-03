
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentWallet } from "@/components/dashboard/DocumentWallet";
import { ExamTracker } from "@/components/dashboard/ExamTracker";
import { DocProcessorButton } from "@/components/dashboard/DocProcessorButton";
import { useAuth } from "@/lib/store";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("documents");

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your documents and track your exam applications
            </p>
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 h-auto p-1">
              <TabsTrigger value="documents" className="py-2">Document Wallet</TabsTrigger>
              <TabsTrigger value="exams" className="py-2">Exam Tracker</TabsTrigger>
            </TabsList>
            
            <TabsContent value="documents" className="space-y-4">
              <DocProcessorButton />
              <DocumentWallet />
            </TabsContent>
            
            <TabsContent value="exams" className="space-y-4">
              <ExamTracker />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
