
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
        const { supabase } = await import('../supabase');
        
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
