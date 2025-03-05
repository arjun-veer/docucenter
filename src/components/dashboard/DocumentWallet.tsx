
import { useState, useEffect, useRef } from 'react';
import { useDocuments } from '@/lib/store';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export const DocumentWallet = () => {
  const { documents, uploadDocument, fetchDocuments, isLoading } = useDocuments();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  // Get documents organized by category
  const getDocumentsByCategory = () => {
    const documentsByCategory: Record<string, any[]> = {};
    
    // Initialize with default categories
    documentsByCategory['Certificates'] = [];
    documentsByCategory['Identity'] = [];
    documentsByCategory['Exam Documents'] = [];
    documentsByCategory['Processed Documents'] = [];
    documentsByCategory['Uncategorized'] = [];
    
    // Group documents by category
    documents.forEach(document => {
      const category = document.category || 'Uncategorized';
      if (!documentsByCategory[category]) {
        documentsByCategory[category] = [];
      }
      documentsByCategory[category].push(document);
    });
    
    // Filter out empty categories
    return Object.fromEntries(
      Object.entries(documentsByCategory)
        .filter(([_, docs]) => docs.length > 0 || ['Certificates', 'Identity', 'Exam Documents', 'Uncategorized'].includes(_))
    );
  };
  
  const documentsByCategory = getDocumentsByCategory();
  const categories = Object.keys(documentsByCategory);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, JPEG, PNG, or DOCX files.');
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Please upload files smaller than 10MB.');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Get file category based on name
      let category = 'Uncategorized';
      const fileName = file.name.toLowerCase();
      
      if (fileName.includes('marksheet') || fileName.includes('certificate')) {
        category = 'Certificates';
      } else if (fileName.includes('id') || fileName.includes('card') || fileName.includes('aadhar')) {
        category = 'Identity';
      } else if (fileName.includes('admit') || fileName.includes('exam')) {
        category = 'Exam Documents';
      }
      
      await uploadDocument(file, category);
      toast.success('Document uploaded successfully');
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refetch documents to ensure we have the latest data
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Document Wallet</h2>
          <p className="text-muted-foreground mt-1">
            Store and manage your important documents securely
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.jpg,.jpeg,.png"
            className="hidden"
            id="file-upload"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[220px] w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue={categories[0] || 'Uncategorized'} className="w-full">
          <TabsList className="mb-6">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              {documentsByCategory[category].length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {documentsByCategory[category].map((document) => (
                    <DocumentCard key={document.id} document={document} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/30">
                  <div className="rounded-full bg-secondary p-3 mb-4">
                    <PlusIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No documents</h3>
                  <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
                    You haven't uploaded any {category.toLowerCase()} documents yet.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload your first document
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};
