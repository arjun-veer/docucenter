import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Exam } from './types';
import { supabase } from './supabase';

// Auth store for user authentication state
type AuthState = {
  isAuthenticated: boolean;
  currentUser: {
    id: string;
    email: string;
    role: string;
    name?: string;
    verified?: boolean; // Add verified property to fix type error
  } | null;
  login: (user: { id: string; email: string; role: string; name?: string }) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,
      login: (user) => set({ isAuthenticated: true, currentUser: {...user, verified: true} }), // Set verified to true by default
      logout: () => set({ isAuthenticated: false, currentUser: null }),
    }),
    {
      name: 'auth',
    }
  )
);

// Exams store for managing exam subscriptions
type ExamsState = {
  subscribedExams: string[];
  exams: Exam[];
  fetchExams: () => Promise<void>;
  subscribeToExam: (examId: string) => void;
  unsubscribeFromExam: (examId: string) => void;
};

export const useExams = create<ExamsState>()(
  persist(
    (set) => ({
      subscribedExams: [],
      exams: [],
      fetchExams: async () => {
        try {
          const { data, error } = await supabase
            .from('exams')
            .select('*');
            
          if (error) throw error;
          
          // Transform the data to match the Exam type
          const transformedExams = data.map((exam: any) => ({
            id: exam.id,
            name: exam.name,
            category: exam.category,
            registrationStartDate: new Date(exam.registration_start_date),
            registrationEndDate: new Date(exam.registration_end_date),
            examDate: exam.exam_date ? new Date(exam.exam_date) : undefined,
            resultDate: exam.result_date ? new Date(exam.result_date) : undefined,
            websiteUrl: exam.website_url,
            description: exam.description,
            eligibility: exam.eligibility,
            applicationFee: exam.application_fee,
          }));
          
          set({ exams: transformedExams });
        } catch (error) {
          console.error('Error fetching exams:', error);
          throw error;
        }
      },
      subscribeToExam: (examId) =>
        set((state) => ({
          subscribedExams: [...state.subscribedExams, examId],
        })),
      unsubscribeFromExam: (examId) =>
        set((state) => ({
          subscribedExams: state.subscribedExams.filter((id) => id !== examId),
        })),
    }),
    {
      name: 'exams',
    }
  )
);

// Documents store for managing uploaded documents
type DocumentsState = {
  documents: {
    id: string;
    name: string;
    url: string;
    category: string;
  }[];
  uploadDocument: (file: File, category: string) => Promise<void>;
  deleteDocument: (documentId: string) => void;
};

export const useDocuments = create<DocumentsState>()(
  persist(
    (set) => ({
      documents: [],
      uploadDocument: async (file: File, category: string) => {
        const { supabase } = await import('./supabase');
        
        try {
          const filePath = `documents/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);
            
          if (uploadError) {
            throw uploadError;
          }
          
          const { data: storageData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);
            
          const newDocument = {
            id: Date.now().toString(),
            name: file.name,
            url: storageData.publicUrl,
            category: category,
          };
          
          set((state) => ({
            documents: [...state.documents, newDocument],
          }));
        } catch (error: any) {
          console.error('Error uploading document:', error);
          throw new Error(error.message);
        }
      },
      deleteDocument: (documentId: string) =>
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== documentId),
        })),
    }),
    {
      name: 'documents',
    }
  )
);

// Settings store for API keys and preferences
export type SettingsState = {
  perplexityApiKey: string | null;
  serpApiKey: string | null;
  setPerplexityApiKey: (key: string) => void;
  setSerpApiKey: (key: string) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      perplexityApiKey: null,
      serpApiKey: null,
      setPerplexityApiKey: (key: string) => set({ perplexityApiKey: key }),
      setSerpApiKey: (key: string) => set({ serpApiKey: key }),
    }),
    {
      name: 'settings',
    }
  )
);
