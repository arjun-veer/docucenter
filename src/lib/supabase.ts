
import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in the production environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAwfQ.example';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials missing. Using fallback values for development. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables for production.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
