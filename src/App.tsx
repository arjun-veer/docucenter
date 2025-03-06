
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/stores/auth-store';
import { toast } from 'sonner';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import ExamDetails from '@/pages/ExamDetails';
import Exams from '@/pages/Exams';
import AdminDashboard from '@/pages/AdminDashboard';
import NotFound from '@/pages/NotFound';
import Settings from '@/pages/Settings';
import DocumentProcessor from '@/pages/DocumentProcessor';
import Notifications from '@/pages/Notifications';

function App() {
  const { initializeFromSupabase, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  // Initialize auth from Supabase session when app loads
  useEffect(() => {
    const initAuth = async () => {
      await initializeFromSupabase();
      console.log('Auth initialized');
    };
    
    initAuth();
  }, [initializeFromSupabase]);

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN') {
          await initializeFromSupabase();
          toast.success('Successfully signed in');
          navigate('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          toast.info('Signed out');
          navigate('/auth');
        }
      }
    );

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [initializeFromSupabase, navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/exams/:id" element={<ExamDetails />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/document-processor" element={<DocumentProcessor />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
