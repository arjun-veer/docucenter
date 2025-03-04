
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
    verified?: boolean;
  } | null;
  login: (user: { id: string; email: string; role: string; name?: string }) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,
      login: (user) => set({ isAuthenticated: true, currentUser: {...user, verified: true} }),
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
    (set, get) => ({
      subscribedExams: [],
      exams: [],
      fetchExams: async () => {
        try {
          // Use .from() directly with error handling but avoid using status code checks
          const { data, error } = await supabase
            .from('exams')
            .select('*');
            
          if (error) {
            console.error('Error fetching exams:', error);
            throw error;
          }
          
          if (!data) {
            console.log('No exam data returned');
            return;
          }
          
          // Transform the data to match the Exam type
          const subscribedExams = get().subscribedExams;
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
            isSubscribed: subscribedExams.includes(exam.id),
          }));
          
          console.log('Fetched exams:', transformedExams);
          set({ exams: transformedExams });
        } catch (error) {
          console.error('Error in fetchExams:', error);
          throw error;
        }
      },
      subscribeToExam: (examId) =>
        set((state) => {
          const updatedSubscribedExams = [...state.subscribedExams, examId];
          // Update the isSubscribed property in the exams array
          const updatedExams = state.exams.map(exam => 
            exam.id === examId ? { ...exam, isSubscribed: true } : exam
          );
          
          return {
            subscribedExams: updatedSubscribedExams,
            exams: updatedExams,
          };
        }),
      unsubscribeFromExam: (examId) =>
        set((state) => {
          const updatedSubscribedExams = state.subscribedExams.filter(id => id !== examId);
          // Update the isSubscribed property in the exams array
          const updatedExams = state.exams.map(exam => 
            exam.id === examId ? { ...exam, isSubscribed: false } : exam
          );
          
          return {
            subscribedExams: updatedSubscribedExams,
            exams: updatedExams,
          };
        }),
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
  darkMode: boolean;
  setPerplexityApiKey: (key: string) => void;
  setSerpApiKey: (key: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      perplexityApiKey: null,
      serpApiKey: null,
      darkMode: false,
      setPerplexityApiKey: (key: string) => set({ perplexityApiKey: key }),
      setSerpApiKey: (key: string) => set({ serpApiKey: key }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (enabled: boolean) => set({ darkMode: enabled }),
    }),
    {
      name: 'settings',
    }
  )
);
