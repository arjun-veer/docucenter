
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provide fallbacks for development or testing
const prodUrl = 'https://elhylaucggxmrgyhnuwh.supabase.co';
const prodKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaHlsYXVjZ2d4bXJneWhudXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4Mzc4NDcsImV4cCI6MjA1NjQxMzg0N30.pgVDZkRFXJVXgshfY40w28T__NMeOYDjGYQK-lAACmY';

// Use the environment variables if available, fallback for development
const url = supabaseUrl || (import.meta.env.DEV ? prodUrl : '');
const key = supabaseAnonKey || (import.meta.env.DEV ? prodKey : '');

// Check if we're missing credentials
if (!url || !key) {
  console.error('Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Create Supabase client with better error handling
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (...args) => {
      return fetch(...args).catch(err => {
        console.error('Network error when contacting Supabase:', err);
        throw err;
      });
    },
  },
});

// Add a simple method to check connectivity
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('exams').select('id').limit(1);
    if (error) throw error;
    return { connected: true, error: null };
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return { connected: false, error: err };
  }
};

// Database types
export type Database = {
  public: {
    Tables: {
      exams: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string;
          registration_start_date: string;
          registration_end_date: string;
          exam_date: string | null;
          result_date: string | null;
          website_url: string;
          eligibility: string | null;
          application_fee: string | null;
          created_at: string;
          updated_at: string;
          is_verified: boolean;
          answer_key_date: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description: string;
          registration_start_date: string;
          registration_end_date: string;
          exam_date?: string | null;
          result_date?: string | null;
          website_url: string;
          eligibility?: string | null;
          application_fee?: string | null;
          created_at?: string;
          updated_at?: string;
          is_verified?: boolean;
          answer_key_date?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string;
          registration_start_date?: string;
          registration_end_date?: string;
          exam_date?: string | null;
          result_date?: string | null;
          website_url?: string;
          eligibility?: string | null;
          application_fee?: string | null;
          created_at?: string;
          updated_at?: string;
          is_verified?: boolean;
          answer_key_date?: string | null;
        };
      };
      user_exam_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exam_id?: string;
          created_at?: string;
        };
      };
      user_documents: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          storage_path?: string;
          category?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
