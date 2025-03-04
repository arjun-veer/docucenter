
import { supabase } from './supabase';
import { toast } from 'sonner';

/**
 * Validates that the Supabase connection is working properly
 * @returns Promise<boolean> - True if connection is working, false otherwise
 */
export const validateSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Try to get the authenticated user
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Supabase auth error:', authError);
      toast.error('Supabase authentication error: ' + authError.message);
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
      toast.error('Supabase database error: ' + dbError.message);
      return false;
    }
    
    // Check if the storage bucket exists
    const { error: storageError } = await supabase
      .storage
      .getBucket('documents');
      
    if (storageError) {
      console.error('Supabase storage error:', storageError);
      toast.error('Supabase storage error: ' + storageError.message);
      return false;
    }

    // Check pending exams table access (admin-specific)
    if (isAdmin) {
      const { error: pendingError } = await supabase
        .from('pending_exams')
        .select('id')
        .limit(1);

      if (pendingError) {
        console.error('Error accessing pending exams:', pendingError);
        toast.error('Error accessing admin features: ' + pendingError.message);
        return false;
      }
    }
    
    // All checks passed
    console.log('Supabase connection validated successfully');
    return true;
  } catch (error) {
    console.error('Error validating Supabase connection:', error);
    toast.error('Failed to validate Supabase connection');
    return false;
  }
};
