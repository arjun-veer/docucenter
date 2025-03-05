
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DocumentWallet } from '@/components/dashboard/DocumentWallet';
import { ExamTracker } from '@/components/dashboard/ExamTracker';
import { DocProcessorButton } from '@/components/dashboard/DocProcessorButton';
import { validateSupabaseConnection } from '@/lib/validateSupabaseConnection';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Validate Supabase connection when dashboard loads
    const validateConnection = async () => {
      setIsLoading(true);
      try {
        const isValid = await validateSupabaseConnection();
        setIsConnected(isValid);
        if (isValid) {
          toast.success('Connected to Supabase successfully');
        }
      } catch (error) {
        console.error('Connection validation error:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    validateConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="col-span-full lg:col-span-2">
                <ExamTracker />
              </div>
              
              <div className="md:col-span-full lg:col-span-1">
                <DocProcessorButton />
              </div>
            </div>
            
            <DocumentWallet />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
