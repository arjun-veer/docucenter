
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/store';

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
  const { initializeFromSupabase } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth from Supabase session
    initializeFromSupabase();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          await initializeFromSupabase();
          navigate('/dashboard');
        } else if (event === 'SIGNED_OUT') {
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
