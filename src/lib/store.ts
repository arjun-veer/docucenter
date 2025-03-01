
import { create } from 'zustand';
import { Exam, User, UserDocument } from './types';
import { currentUser, mockExams, mockDocuments } from './mockData';

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
  
  // Documents
  documents: UserDocument[];
  uploadDocument: (file: File, category?: string) => Promise<UserDocument>;
  deleteDocument: (documentId: string) => void;
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
  
  // Documents
  documents: mockDocuments,
  
  uploadDocument: async (file: File, category?: string) => {
    // Mock upload logic
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
    set(state => ({
      documents: state.documents.filter(doc => doc.id !== documentId)
    }));
  }
}));

// Helper to check authentication
export const useAuth = () => {
  const { isAuthenticated, currentUser, login, signup, logout } = useAppStore();
  return { isAuthenticated, currentUser, login, signup, logout };
};

// Helper to access exams
export const useExams = () => {
  const { exams, subscribedExams, subscribeToExam, unsubscribeFromExam } = useAppStore();
  return { exams, subscribedExams, subscribeToExam, unsubscribeFromExam };
};

// Helper to access documents
export const useDocuments = () => {
  const { documents, uploadDocument, deleteDocument } = useAppStore();
  return { documents, uploadDocument, deleteDocument };
};
