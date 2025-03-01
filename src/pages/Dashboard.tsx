
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ExamTracker } from '@/components/dashboard/ExamTracker';
import { DocumentWallet } from '@/components/dashboard/DocumentWallet';
import { useAuth } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated || !currentUser) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 pt-28 pb-16">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome, {currentUser.name || 'Student'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your exam preparation and documents
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Last login: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </header>
          
          <Tabs defaultValue="exams" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="exams" className="text-base">Exam Tracker</TabsTrigger>
              <TabsTrigger value="documents" className="text-base">Document Wallet</TabsTrigger>
            </TabsList>
            
            <TabsContent value="exams" className="space-y-8">
              <ExamTracker />
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-8">
              <DocumentWallet />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
