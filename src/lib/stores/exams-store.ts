
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Exam } from '../types';
import { supabase } from '../supabase';
import { toast } from 'sonner';

// Exams store for managing exam subscriptions
type ExamsState = {
  subscribedExams: string[];
  exams: Exam[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchExams: () => Promise<void>;
  subscribeToExam: (examId: string) => void;
  unsubscribeFromExam: (examId: string) => void;
};

// Cache duration - 1 hour in milliseconds
const CACHE_DURATION = 60 * 60 * 1000;

export const useExams = create<ExamsState>()(
  persist(
    (set, get) => ({
      subscribedExams: [],
      exams: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      fetchExams: async () => {
        try {
          const currentTime = Date.now();
          const lastFetched = get().lastFetched;
          const exams = get().exams;
          
          // Use cached data if available and fresh
          if (exams.length > 0 && lastFetched && (currentTime - lastFetched < CACHE_DURATION)) {
            console.log('Using cached exam data, last fetched at:', new Date(lastFetched).toLocaleString());
            return;
          }
          
          // If we're already loading, don't fetch again
          if (get().isLoading) {
            console.log('Already fetching exam data, skipping duplicate request');
            return;
          }
          
          console.log('Fetching fresh exam data from the database...');
          set({ isLoading: true, error: null });
          
          // Fetch complete data from the database with error handling
          const { data, error } = await supabase
            .from('exams')
            .select('*')
            .order('registration_end_date', { ascending: true });
            
          if (error) {
            console.error('Error fetching exams:', error);
            set({ isLoading: false, error: error.message });
            toast.error(`Failed to load exams: ${error.message}`);
            return;
          }
          
          if (!data || data.length === 0) {
            console.log('No exam data returned');
            set({ 
              isLoading: false, 
              exams: [],
              lastFetched: currentTime 
            });
            return;
          }
          
          console.log(`Fetched ${data.length} exams from database`);
          
          // Transform the data to match the Exam type and update subscription status
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
          
          set({ 
            exams: transformedExams, 
            isLoading: false,
            error: null,
            lastFetched: currentTime
          });
        } catch (error: any) {
          console.error('Error in fetchExams:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to fetch exams' 
          });
          toast.error(`Failed to load exams: ${error.message || 'Unknown error'}`);
        }
      },
      subscribeToExam: (examId) =>
        set((state) => {
          // Don't subscribe if already subscribed
          if (state.subscribedExams.includes(examId)) {
            return state;
          }
          
          const updatedSubscribedExams = [...state.subscribedExams, examId];
          // Update the isSubscribed property in the exams array
          const updatedExams = state.exams.map(exam => 
            exam.id === examId ? { ...exam, isSubscribed: true } : exam
          );
          
          toast.success('Successfully subscribed to exam notifications');
          
          return {
            subscribedExams: updatedSubscribedExams,
            exams: updatedExams,
          };
        }),
      unsubscribeFromExam: (examId) =>
        set((state) => {
          // Don't unsubscribe if not subscribed
          if (!state.subscribedExams.includes(examId)) {
            return state;
          }
          
          const updatedSubscribedExams = state.subscribedExams.filter(id => id !== examId);
          // Update the isSubscribed property in the exams array
          const updatedExams = state.exams.map(exam => 
            exam.id === examId ? { ...exam, isSubscribed: false } : exam
          );
          
          toast.success('Successfully unsubscribed from exam notifications');
          
          return {
            subscribedExams: updatedSubscribedExams,
            exams: updatedExams,
          };
        }),
    }),
    {
      name: 'exams-storage', // More specific name for localStorage
      partialize: (state) => ({
        subscribedExams: state.subscribedExams,
        exams: state.exams,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
