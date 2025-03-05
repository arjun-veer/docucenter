
import { supabase } from './supabase';
import { toast } from 'sonner';

/**
 * Validates that the Supabase connection is working properly
 * @returns Promise<boolean> - True if connection is working, false otherwise
 */
export const validateSupabaseConnection = async (): Promise<boolean> => {
  try {
    if (import.meta.env.DEV && !import.meta.env.VITE_SUPABASE_URL) {
      console.warn('Skipping Supabase validation - no connection details in development mode');
      toast.warning('Running with mock Supabase in development mode');
      return true;
    }
    
    // Ensure the user is authenticated
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Supabase auth session error:', sessionError);
      toast.error('Cannot connect to Supabase: ' + sessionError?.message);
      return false;
    }
    
    // Handle unauthenticated users
    if (!session?.session) {
      console.log('No active session - user not authenticated');
      // No toast here as this is not necessarily an error
      return false;
    }

    // Try to get the authenticated user
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Supabase auth error:', authError);
      toast.error('Authentication error: ' + authError.message);
      return false;
    }

    // For admin routes, verify admin access
    const isAdmin = userData.user?.user_metadata?.role === 'admin';
    if (window.location.pathname.includes('/admin') && !isAdmin) {
      console.error('User is not an admin');
      toast.error('You do not have admin privileges');
      return false;
    }
    
    // Try a simple query to verify database connection
    const { error: dbError } = await supabase
      .from('exams')
      .select('id')
      .limit(1);
      
    if (dbError) {
      console.error('Supabase database error:', dbError);
      toast.error('Database connection error: ' + dbError.message);
      return false;
    }
    
    // Check if the storage bucket exists
    const { error: storageError } = await supabase
      .storage
      .getBucket('documents');
      
    if (storageError) {
      console.warn('Supabase storage error:', storageError);
      // This might not be critical, so just warn
      toast.warning('Storage bucket access issue: ' + storageError.message);
    }

    // Check pending exams table access (admin-specific)
    if (isAdmin) {
      const { error: pendingError } = await supabase
        .from('pending_exams')
        .select('id')
        .limit(1);

      if (pendingError) {
        console.warn('Error accessing pending exams:', pendingError);
        toast.warning('Limited admin functionality: ' + pendingError.message);
      }
    }
    
    // All checks passed
    console.log('Supabase connection validated successfully');
    return true;
  } catch (error: any) {
    console.error('Error validating Supabase connection:', error);
    toast.error('Failed to connect to Supabase: ' + (error.message || 'Unknown error'));
    return false;
  }
};
