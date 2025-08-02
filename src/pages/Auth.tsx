
import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { isAuthenticated, initializeFromSupabase } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';
  
  // Check if user is already authenticated with Supabase
  useEffect(() => {
    const checkAuth = async () => {
      await initializeFromSupabase();
    };
    
    checkAuth();
  }, [initializeFromSupabase]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 mt-16">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to home
          </Link>
          
          <AuthForm defaultMode={mode as 'signin' | 'signup'} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
