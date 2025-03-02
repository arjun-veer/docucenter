import { create } from 'zustand';
import { Exam, User, UserDocument } from './types';
import { currentUser, mockExams, mockDocuments } from './mockData';
import { supabase } from './supabase';
import { setPerplexityApiKey, getPerplexityApiKey } from './perplexity';
import { toast } from 'sonner';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  
  // Exams
  exams: Exam[];
  subscribedExams: Exam[];
  subscribeToExam: (examId: string) => void;
  unsubscribeFromExam: (examId: string) => void;
  fetchExams: () => Promise<void>;
  
  // Documents
  documents: UserDocument[];
  uploadDocument: (file: File, category?: string) => Promise<UserDocument>;
  deleteDocument: (documentId: string) => void;

  // Settings
  perplexityApiKey: string | null;
  setPerplexityApiKey: (key: string) => void;
}

// For demo purposes, we'll use a simple store without actual API calls
export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  isAuthenticated: true, // Set to true for demo
  currentUser: currentUser,
  
  login: async (email: string, password: string) => {
    // Mock login logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ 
      isAuthenticated: true, 
      currentUser: currentUser 
    });
    return true;
  },
  
  signup: async (email: string, password: string, name?: string) => {
    // Mock signup logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ 
      isAuthenticated: true, 
      currentUser: { 
        ...currentUser, 
        email, 
        name: name || 'New User' 
      } 
    });
    return true;
  },
  
  logout: () => {
    set({ 
      isAuthenticated: false, 
      currentUser: null 
    });
  },
  
  // Exams
  exams: mockExams,
  subscribedExams: mockExams.filter(exam => exam.isSubscribed),
  
  subscribeToExam: (examId: string) => {
    // If Supabase is configured, save subscription to database
    const { currentUser } = get();
    if (supabase && currentUser) {
      supabase
        .from('user_exam_subscriptions')
        .insert({
          user_id: currentUser.id,
          exam_id: examId
        })
        .then(({ error }) => {
          if (error) console.error('Error subscribing to exam:', error);
        });
    }
    
    set(state => {
      const updatedExams = state.exams.map(exam => 
        exam.id === examId ? { ...exam, isSubscribed: true } : exam
      );
      
      return {
        exams: updatedExams,
        subscribedExams: updatedExams.filter(exam => exam.isSubscribed)
      };
    });
  },
  
  unsubscribeFromExam: (examId: string) => {
    // If Supabase is configured, remove subscription from database
    const { currentUser } = get();
    if (supabase && currentUser) {
      supabase
        .from('user_exam_subscriptions')
        .delete()
        .match({ user_id: currentUser.id, exam_id: examId })
        .then(({ error }) => {
          if (error) console.error('Error unsubscribing from exam:', error);
        });
    }
    
    set(state => {
      const updatedExams = state.exams.map(exam => 
        exam.id === examId ? { ...exam, isSubscribed: false } : exam
      );
      
      return {
        exams: updatedExams,
        subscribedExams: updatedExams.filter(exam => exam.isSubscribed)
      };
    });
  },
  
  fetchExams: async () => {
    // Check if Supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, using mock data');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('registration_start_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching exams:', error);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('No exams found in database, using mock data');
        return;
      }
      
      // Get user subscriptions to mark exams as subscribed
      const { currentUser } = get();
      let subscriptions: any[] = [];
      
      if (currentUser) {
        const { data: subData } = await supabase
          .from('user_exam_subscriptions')
          .select('exam_id')
          .eq('user_id', currentUser.id);
        
        subscriptions = subData || [];
      }
      
      // Transform database format to application format
      const formattedExams: Exam[] = data.map(exam => ({
        id: exam.id,
        name: exam.name,
        category: exam.category as any,
        registrationStartDate: new Date(exam.registration_start_date),
        registrationEndDate: new Date(exam.registration_end_date),
        examDate: exam.exam_date ? new Date(exam.exam_date) : undefined,
        resultDate: exam.result_date ? new Date(exam.result_date) : undefined,
        websiteUrl: exam.website_url,
        description: exam.description,
        eligibility: exam.eligibility || undefined,
        applicationFee: exam.application_fee || undefined,
        isSubscribed: subscriptions.some(sub => sub.exam_id === exam.id)
      }));
      
      set({
        exams: formattedExams,
        subscribedExams: formattedExams.filter(exam => exam.isSubscribed)
      });
    } catch (error) {
      console.error('Error in fetchExams:', error);
    }
  },
  
  // Documents
  documents: mockDocuments,
  
  uploadDocument: async (file: File, category?: string) => {
    // Check if Supabase is configured
    const { currentUser } = get();
    
    if (supabase && currentUser) {
      try {
        // First upload to storage
        const filePath = `${currentUser.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);
        
        if (uploadError) {
          console.error('Error uploading to Supabase Storage:', uploadError);
          throw uploadError;
        }
        
        // Then save metadata in database
        const newDocument = {
          user_id: currentUser.id,
          file_name: file.name,
          file_type: file.name.split('.').pop() || '',
          file_size: Math.floor(file.size / 1024),
          storage_path: filePath,
          category: category || 'Uncategorized'
        };
        
        const { data, error } = await supabase
          .from('user_documents')
          .insert(newDocument)
          .select('*')
          .single();
        
        if (error) {
          console.error('Error saving document metadata:', error);
          throw error;
        }
        
        // Get public URL
        const { data: publicURL } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        
        return {
          id: data.id,
          userId: data.user_id,
          fileName: data.file_name,
          fileType: data.file_type as any,
          fileSize: data.file_size,
          url: publicURL.publicUrl,
          createdAt: new Date(data.created_at),
          category: data.category || undefined
        };
      } catch (error) {
        console.error('Error in uploadDocument:', error);
        // Fall back to mock upload if Supabase fails
      }
    }
    
    // Mock upload logic (fallback)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDocument: UserDocument = {
      id: `doc-${Math.random().toString(36).substring(2, 9)}`,
      userId: currentUser.id,
      fileName: file.name,
      fileType: file.name.split('.').pop() as any,
      fileSize: Math.floor(file.size / 1024),
      url: '/placeholder.svg',
      createdAt: new Date(),
      category: category || 'Uncategorized'
    };
    
    set(state => ({
      documents: [...state.documents, newDocument]
    }));
    
    return newDocument;
  },
  
  deleteDocument: (documentId: string) => {
    const { documents, currentUser } = get();
    const docToDelete = documents.find(d => d.id === documentId);
    
    if (supabase && docToDelete && currentUser) {
      // Delete from Supabase if configured
      supabase
        .from('user_documents')
        .delete()
        .match({ id: documentId })
        .then(({ error }) => {
          if (error) console.error('Error deleting document metadata:', error);
          else {
            // Also delete from storage if metadata deletion was successful
            supabase.storage
              .from('documents')
              .remove([docToDelete.url])
              .then(({ error }) => {
                if (error) console.error('Error deleting document from storage:', error);
              });
          }
        });
    }
    
    set(state => ({
      documents: state.documents.filter(doc => doc.id !== documentId)
    }));
  },
  
  // Settings
  perplexityApiKey: null,
  setPerplexityApiKey: (key: string) => {
    setPerplexityApiKey(key); // Set in the module for API calls
    set({ perplexityApiKey: key });
    
    // Store in localStorage for persistence between sessions
    localStorage.setItem('perplexityApiKey', key);
    
    toast.success('Perplexity API key saved');
  }
}));

// On app initialization, try to load the API key from localStorage
if (typeof window !== 'undefined') {
  const storedKey = localStorage.getItem('perplexityApiKey');
  if (storedKey) {
    useAppStore.getState().setPerplexityApiKey(storedKey);
  }
}

// Helper to check authentication
export const useAuth = () => {
  const { isAuthenticated, currentUser, login, signup, logout } = useAppStore();
  return { isAuthenticated, currentUser, login, signup, logout };
};

// Helper to access exams
export const useExams = () => {
  const { 
    exams, 
    subscribedExams, 
    subscribeToExam, 
    unsubscribeFromExam,
    fetchExams
  } = useAppStore();
  
  return { 
    exams, 
    subscribedExams, 
    subscribeToExam, 
    unsubscribeFromExam,
    fetchExams
  };
};

// Helper to access documents
export const useDocuments = () => {
  const { documents, uploadDocument, deleteDocument } = useAppStore();
  return { documents, uploadDocument, deleteDocument };
};

// Helper to access settings
export const useSettings = () => {
  const { perplexityApiKey, setPerplexityApiKey } = useAppStore();
  return { perplexityApiKey, setPerplexityApiKey };
};
