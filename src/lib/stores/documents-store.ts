
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserDocument } from '../types';
import { supabase } from '../supabase';
import { toast } from 'sonner';

type DocumentsState = {
  documents: UserDocument[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File, category: string) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const useDocuments = create<DocumentsState>()(
  persist(
    (set, get) => ({
      documents: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      
      fetchDocuments: async () => {
        try {
          const currentTime = Date.now();
          const lastFetched = get().lastFetched;
          const documents = get().documents;
          
          // Force refresh if no documents are loaded yet
          if (documents.length === 0 || !lastFetched || (currentTime - lastFetched > CACHE_DURATION)) {
            console.log('Fetching fresh document data from the database...');
            set({ isLoading: true, error: null });
            
            const { data: currentUser } = await supabase.auth.getUser();
            if (!currentUser?.user) {
              set({ isLoading: false, error: 'User not authenticated' });
              return;
            }
            
            const { data, error } = await supabase
              .from('user_documents')
              .select('*')
              .eq('user_id', currentUser.user.id);
              
            if (error) {
              console.error('Error fetching documents:', error);
              set({ isLoading: false, error: error.message });
              return;
            }
            
            // Transform the data to match the UserDocument type
            const transformedDocs = Array.isArray(data) ? data.map((doc: any) => ({
              id: doc.id,
              userId: doc.user_id,
              fileName: doc.file_name,
              fileType: doc.file_type,
              fileSize: doc.file_size,
              category: doc.category || 'Uncategorized',
              createdAt: new Date(doc.created_at),
              url: doc.storage_path,
            })) : [];
            
            set({ 
              documents: transformedDocs, 
              isLoading: false,
              lastFetched: currentTime
            });
          } else {
            console.log('Using cached document data, last fetched at:', new Date(lastFetched).toLocaleString());
          }
        } catch (error: any) {
          console.error('Error in fetchDocuments:', error);
          set({ isLoading: false, error: error.message });
        }
      },
      
      uploadDocument: async (file: File, category: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data: currentUser } = await supabase.auth.getUser();
          if (!currentUser?.user) {
            set({ isLoading: false, error: 'User not authenticated' });
            throw new Error('User not authenticated');
          }
          
          const filePath = `documents/${currentUser.user.id}/${Date.now()}_${file.name}`;
          
          // First check if documents bucket exists, create if not
          const { data: buckets } = await supabase.storage.listBuckets();
          const documentsBucketExists = buckets?.some(bucket => bucket.name === 'documents');
          
          if (!documentsBucketExists) {
            console.log('Documents bucket does not exist, creating it...');
            const { error: bucketError } = await supabase.storage.createBucket('documents', {
              public: true,
            });
            
            if (bucketError) {
              console.error('Error creating bucket:', bucketError);
              throw bucketError;
            }
          }
          
          // Upload file to Storage
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            console.error('Error uploading to storage:', uploadError);
            set({ isLoading: false, error: uploadError.message });
            throw uploadError;
          }
          
          const { data: storageData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);
            
          // Add record to database
          const { data, error: insertError } = await supabase
            .from('user_documents')
            .insert({
              user_id: currentUser.user.id,
              file_name: file.name,
              file_type: file.type.split('/').pop() || 'unknown',
              file_size: Math.round(file.size / 1024), // Convert to KB
              storage_path: storageData.publicUrl,
              category: category || 'Uncategorized'
            })
            .select()
            .single();
            
          if (insertError) {
            console.error('Error inserting document record:', insertError);
            set({ isLoading: false, error: insertError.message });
            throw insertError;
          }
          
          // Add to local state
          const newDocument: UserDocument = {
            id: data.id,
            userId: data.user_id,
            fileName: data.file_name,
            fileType: data.file_type,
            fileSize: data.file_size,
            category: data.category || 'Uncategorized',
            createdAt: new Date(data.created_at),
            url: data.storage_path,
          };
          
          set((state) => ({
            documents: [...state.documents, newDocument],
            isLoading: false,
            lastFetched: Date.now()
          }));
          
        } catch (error: any) {
          console.error('Error uploading document:', error);
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
      
      deleteDocument: async (documentId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const document = get().documents.find(doc => doc.id === documentId);
          if (!document) {
            set({ isLoading: false, error: 'Document not found' });
            return;
          }
          
          // Delete from the database
          const { error: deleteError } = await supabase
            .from('user_documents')
            .delete()
            .eq('id', documentId);
            
          if (deleteError) {
            console.error('Error deleting document record:', deleteError);
            set({ isLoading: false, error: deleteError.message });
            return;
          }
          
          // Also delete from storage if needed (extract file path from URL)
          if (document.url) {
            try {
              // Extract the path from the URL (everything after /documents/)
              const urlParts = document.url.split('/');
              const fileIndex = urlParts.findIndex(part => part === 'documents');
              if (fileIndex !== -1 && fileIndex < urlParts.length - 1) {
                const storagePath = urlParts.slice(fileIndex + 1).join('/');
                
                const { error: storageError } = await supabase.storage
                  .from('documents')
                  .remove([storagePath]);
                  
                if (storageError) {
                  console.error('Error deleting from storage:', storageError);
                  // Continue even if storage delete fails
                }
              }
            } catch (error) {
              console.error('Error parsing storage path:', error);
              // Continue even if storage delete fails
            }
          }
          
          // Update local state
          set((state) => ({
            documents: state.documents.filter((doc) => doc.id !== documentId),
            isLoading: false,
            lastFetched: Date.now()
          }));
        } catch (error: any) {
          console.error('Error deleting document:', error);
          set({ isLoading: false, error: error.message });
        }
      },
    }),
    {
      name: 'documents',
    }
  )
);
