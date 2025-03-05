
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatFileSize, validateFile } from '@/lib/fileUtils';
import { FileText, RefreshCw, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploaderProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  onClear: () => void;
  supportedImageTypes: string[];
}

export const FileUploader = ({
  selectedFile,
  setSelectedFile,
  previewUrl,
  setPreviewUrl,
  onClear,
  supportedImageTypes
}: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate the file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <h3 className="text-lg font-medium">Input File</h3>
        <p className="text-sm text-muted-foreground">
          Upload a file to process
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-primary transition-colors cursor-pointer" 
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            supportedImageTypes.includes(selectedFile?.type || '') ? (
              <img 
                src={previewUrl} 
                alt="Input preview" 
                className="max-w-full max-h-[200px] object-contain mb-4"
              />
            ) : (
              <div className="flex flex-col items-center justify-center mb-4">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <p className="mt-2 font-medium">{selectedFile?.name}</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-6">
              <Upload className="h-10 w-10 mb-2" />
              <p>Click to upload a file</p>
              <p className="text-xs mt-1">Images, PDFs, or documents</p>
            </div>
          )}
          
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />
        </div>
        
        {selectedFile && (
          <div className="text-sm text-muted-foreground">
            <p><strong>Name:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClear}
            disabled={!selectedFile}
          >
            <Trash className="h-4 w-4 mr-1" />
            Clear
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Change
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
