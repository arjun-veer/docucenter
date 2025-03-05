
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Exam } from '../types';
import { supabase } from '../supabase';

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

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

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
          
          // If we have data and it was fetched less than CACHE_DURATION ago, use the cached data
          if (exams.length > 0 && lastFetched && (currentTime - lastFetched < CACHE_DURATION)) {
            console.log('Using cached exam data, last fetched at:', new Date(lastFetched).toLocaleString());
            return;
          }
          
          console.log('Fetching fresh exam data from the database...');
          set({ isLoading: true, error: null });
          
          // Fetch complete data from the database
          const { data, error } = await supabase
            .from('exams')
            .select('*');
            
          if (error) {
            console.error('Error fetching exams:', error);
            set({ isLoading: false, error: error.message });
            throw error;
          }
          
          if (!data) {
            console.log('No exam data returned');
            set({ isLoading: false, exams: [] });
            return;
          }
          
          console.log('Fetched raw exam data:', data);
          
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
          
          console.log('Transformed exams:', transformedExams);
          set({ 
            exams: transformedExams, 
            isLoading: false,
            lastFetched: currentTime
          });
        } catch (error: any) {
          console.error('Error in fetchExams:', error);
          set({ isLoading: false, error: error.message });
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
