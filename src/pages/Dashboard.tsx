
import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DocumentWallet } from '@/components/dashboard/DocumentWallet';
import { ExamTracker } from '@/components/dashboard/ExamTracker';
import { DocProcessorButton } from '@/components/dashboard/DocProcessorButton';
import { validateSupabaseConnection } from '@/lib/validateSupabaseConnection';
import { toast } from 'sonner';

const Dashboard = () => {
  useEffect(() => {
    // Validate Supabase connection when dashboard loads
    const validateConnection = async () => {
      const isValid = await validateSupabaseConnection();
      if (isValid) {
        toast.success('Connected to Supabase successfully');
      }
    };
    
    validateConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="col-span-full lg:col-span-2">
            <ExamTracker />
          </div>
          
          <div className="md:col-span-full lg:col-span-1">
            <DocProcessorButton />
          </div>
        </div>
        
        <DocumentWallet />
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
