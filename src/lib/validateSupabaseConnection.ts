
import { supabase } from './supabase';
import { toast } from 'sonner';

/**
 * Validates that the Supabase connection is working properly
 * @returns Promise<boolean> - True if connection is working, false otherwise
 */
export const validateSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Try to get the authenticated user
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Supabase auth error:', error);
      toast.error('Supabase authentication error: ' + error.message);
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
    
    // All checks passed
    console.log('Supabase connection validated successfully');
    return true;
  } catch (error) {
    console.error('Error validating Supabase connection:', error);
    toast.error('Failed to validate Supabase connection');
    return false;
  }
};
