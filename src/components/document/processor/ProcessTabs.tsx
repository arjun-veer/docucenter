
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CropIcon, FileText, FileType, ImageIcon } from 'lucide-react';
import { ResizeTab } from './tabs/ResizeTab';
import { CropTab } from './tabs/CropTab';
import { ConvertTab } from './tabs/ConvertTab';
import { ReduceSizeTab } from './tabs/ReduceSizeTab';
import { ProcessedFilePreview } from './ProcessedFilePreview';
import { Area } from 'react-easy-crop/types';

interface ProcessTabsProps {
  selectedFile: File | null;
  processedFile: File | null;
  processedPreviewUrl: string | null;
  previewUrl: string | null;
  isProcessing: boolean;
  supportedImageTypes: string[];
  onResize: (width: number, height: number, quality: number) => Promise<void>;
  onCrop: (croppedAreaPixels: Area) => Promise<void>;
  onConvert: (format: 'jpeg' | 'png' | 'webp', quality: number) => Promise<void>;
  onReduceSize: (targetSizeKB: number) => Promise<void>;
  onSave: () => Promise<void>;
  onDownload: () => void;
}

export const ProcessTabs = ({
  selectedFile,
  processedFile,
  processedPreviewUrl,
  previewUrl,
  isProcessing,
  supportedImageTypes,
  onResize,
  onCrop,
  onConvert,
  onReduceSize,
  onSave,
  onDownload
}: ProcessTabsProps) => {
  const [activeTab, setActiveTab] = useState('size');
  
  const isImageFile = selectedFile && supportedImageTypes.includes(selectedFile.type);
  const isFileSelected = !!selectedFile;

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <h3 className="text-lg font-medium">Process File</h3>
        <p className="text-sm text-muted-foreground">
          Select an operation to perform
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="size">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Reduce Size
              </span>
            </TabsTrigger>
            <TabsTrigger value="resize" disabled={!isImageFile}>
              <span className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Resize
              </span>
            </TabsTrigger>
            <TabsTrigger value="crop" disabled={!isImageFile}>
              <span className="flex items-center gap-1">
                <CropIcon className="h-4 w-4" />
                Crop
              </span>
            </TabsTrigger>
            <TabsTrigger value="convert" disabled={!isImageFile}>
              <span className="flex items-center gap-1">
                <FileType className="h-4 w-4" />
                Convert
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="size">
            <ReduceSizeTab 
              onReduceSize={onReduceSize}
              isProcessing={isProcessing}
              disabled={!isFileSelected}
            />
          </TabsContent>
          
          <TabsContent value="resize">
            <ResizeTab 
              onResize={onResize}
              isProcessing={isProcessing}
              disabled={!isImageFile}
            />
          </TabsContent>
          
          <TabsContent value="crop">
            <CropTab 
              previewUrl={previewUrl}
              onCrop={onCrop}
              isProcessing={isProcessing}
              disabled={!isImageFile}
            />
          </TabsContent>
          
          <TabsContent value="convert">
            <ConvertTab 
              onConvert={onConvert}
              isProcessing={isProcessing}
              disabled={!isImageFile}
            />
          </TabsContent>
        </Tabs>
        
        <ProcessedFilePreview 
          processedFile={processedFile}
          processedPreviewUrl={processedPreviewUrl}
          selectedFile={selectedFile}
          onSave={onSave}
          onDownload={onDownload}
          isProcessing={isProcessing}
          supportedImageTypes={supportedImageTypes}
        />
      </CardContent>
    </Card>
  );
};
