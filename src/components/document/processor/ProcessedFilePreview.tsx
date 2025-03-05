
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/fileUtils';
import { FileText, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ProcessedFilePreviewProps {
  processedFile: File | null;
  processedPreviewUrl: string | null;
  selectedFile: File | null;
  onSave: () => Promise<void>;
  onDownload: () => void;
  isProcessing: boolean;
  supportedImageTypes: string[];
}

export const ProcessedFilePreview = ({
  processedFile,
  processedPreviewUrl,
  selectedFile,
  onSave,
  onDownload,
  isProcessing,
  supportedImageTypes
}: ProcessedFilePreviewProps) => {
  if (!processedFile || !processedPreviewUrl) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="border rounded-lg p-4 dark:border-gray-700">
        <h3 className="font-medium mb-2">Processed File</h3>
        {supportedImageTypes.includes(processedFile?.type || '') ? (
          <img 
            src={processedPreviewUrl} 
            alt="Processed preview" 
            className="max-w-full max-h-[250px] object-contain mx-auto"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <p className="mt-2 font-medium">{processedFile?.name}</p>
          </div>
        )}
        
        {processedFile && (
          <div className="text-sm text-muted-foreground mt-2">
            <p><strong>Size:</strong> {formatFileSize(processedFile.size)}</p>
            <p><strong>Type:</strong> {processedFile.type}</p>
            {selectedFile && (
              <p><strong>Size reduction:</strong> {((1 - processedFile.size / selectedFile.size) * 100).toFixed(1)}%</p>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          onClick={onDownload}
          className="flex-1"
        >
          Download
        </Button>
        <Button 
          onClick={onSave}
          disabled={isProcessing}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-1" />
          Save to Documents
        </Button>
      </div>
    </div>
  );
};
