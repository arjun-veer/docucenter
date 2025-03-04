
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
  fetchExams: () => Promise<void>;
  subscribeToExam: (examId: string) => void;
  unsubscribeFromExam: (examId: string) => void;
};

export const useExams = create<ExamsState>()(
  persist(
    (set, get) => ({
      subscribedExams: [],
      exams: [],
      isLoading: false,
      error: null,
      fetchExams: async () => {
        try {
          console.log('Fetching exams...');
          set({ isLoading: true, error: null });
          
          // Use .from() directly with error handling but avoid using status code checks
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
          set({ exams: transformedExams, isLoading: false });
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
