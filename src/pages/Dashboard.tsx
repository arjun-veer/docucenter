
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DocumentWallet } from '@/components/dashboard/DocumentWallet';
import { ExamTracker } from '@/components/dashboard/ExamTracker';
import { DocProcessorButton } from '@/components/dashboard/DocProcessorButton';
import { checkSupabaseConnection } from '@/lib/supabase';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useExams, useDocuments } from '@/lib/store';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const { fetchExams } = useExams();

  useEffect(() => {
    // Check Supabase connection and fetch initial data
    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        // Check Supabase connection
        const { connected, error } = await checkSupabaseConnection();
        setIsConnected(connected);
        
        if (connected) {
          console.log('Connected to Supabase successfully');
          
          // Fetch exams data
          await fetchExams();
          
          // Don't show success toast to avoid too many toasts
        } else {
          console.error('Connection check failed:', error);
          toast.error('Could not connect to database. Using offline data.');
        }
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setIsConnected(false);
        toast.error('Error initializing dashboard. Using offline data if available.');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeDashboard();
  }, [fetchExams]);

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
