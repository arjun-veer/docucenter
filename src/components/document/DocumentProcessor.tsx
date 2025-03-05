
import { useState } from 'react';
import { useDocuments } from '@/lib/store';
import { toast } from 'sonner';
import { resizeImage, cropImage, convertImageFormat, SUPPORTED_IMAGE_TYPES } from '@/lib/fileUtils';
import { FileUploader } from './processor/FileUploader';
import { ProcessTabs } from './processor/ProcessTabs';
import { Area } from 'react-easy-crop/types';

export const DocumentProcessor = () => {
  const { uploadDocument } = useDocuments();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [processedPreviewUrl, setProcessedPreviewUrl] = useState<string | null>(null);
  
  // When component mounts, check if we have a dark theme
  // This effect will run when the component mounts and will detect if we have a dark theme
  // You could use this to adjust your UI if needed
  
  const handleResize = async (width: number, height: number, quality: number) => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }
    
    if (!SUPPORTED_IMAGE_TYPES.includes(selectedFile.type)) {
      toast.error('Resize only works with image files');
      return;
    }
    
    setIsProcessing(true);
    try {
      const resized = await resizeImage(selectedFile, width, height, quality / 100);
      setProcessedFile(resized);
      
      // Create preview URL
      const url = URL.createObjectURL(resized);
      setProcessedPreviewUrl(url);
      
      toast.success(`Image resized to ${width} x ${height}`);
    } catch (error: any) {
      console.error('Resize error:', error);
      toast.error(`Failed to resize image: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReduceFileSize = async (targetSizeKB: number) => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    
    const targetSizeBytes = targetSizeKB * 1024;
    
    // If file is already smaller than target, no need to process
    if (selectedFile.size <= targetSizeBytes) {
      toast.info(`File is already smaller than ${targetSizeKB}KB`);
      return;
    }
    
    setIsProcessing(true);
    try {
      let processedFile: File;
      
      // For images, use resizing to reduce file size
      if (SUPPORTED_IMAGE_TYPES.includes(selectedFile.type)) {
        // Start with high quality and reduce until file size is under target
        let quality = 0.9;
        let finalWidth = selectedFile.size > 5 * 1024 * 1024 ? 1600 : 2000; // Start smaller for very large files
        let finalHeight = 0; // Will be calculated to maintain aspect ratio
        
        // Get original dimensions
        const img = new window.Image();
        await new Promise<void>((resolve) => {
          img.onload = () => {
            // Calculate height to maintain aspect ratio
            finalHeight = Math.round((img.height * finalWidth) / img.width);
            resolve();
          };
          img.src = URL.createObjectURL(selectedFile);
        });
        
        // Try reducing quality first
        let reduced = await resizeImage(selectedFile, finalWidth, finalHeight, quality);
        
        // If still too large, reduce dimensions and quality further
        while (reduced.size > targetSizeBytes && quality > 0.3) {
          quality -= 0.1;
          reduced = await resizeImage(selectedFile, finalWidth, finalHeight, quality);
          
          if (reduced.size > targetSizeBytes && finalWidth > 800) {
            finalWidth -= 200;
            finalHeight = Math.round((img.height * finalWidth) / img.width);
          }
        }
        
        processedFile = reduced;
      } else {
        // For non-image files, we can't do much in the browser
        // In a real app, you'd use a server-side process
        toast.error('Size reduction for non-image files is not supported in the browser');
        setIsProcessing(false);
        return;
      }
      
      setProcessedFile(processedFile);
      
      // Create preview URL
      const url = URL.createObjectURL(processedFile);
      setProcessedPreviewUrl(url);
      
      toast.success(`File reduced to ${(processedFile.size / 1024).toFixed(1)}KB`);
    } catch (error: any) {
      console.error('Size reduction error:', error);
      toast.error(`Failed to reduce file size: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleConvert = async (format: 'jpeg' | 'png' | 'webp', quality: number) => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }
    
    if (!SUPPORTED_IMAGE_TYPES.includes(selectedFile.type)) {
      toast.error('Convert only works with image files');
      return;
    }
    
    setIsProcessing(true);
    try {
      const converted = await convertImageFormat(selectedFile, format, quality / 100);
      setProcessedFile(converted);
      
      // Create preview URL
      const url = URL.createObjectURL(converted);
      setProcessedPreviewUrl(url);
      
      toast.success(`Image converted to ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error('Convert error:', error);
      toast.error(`Failed to convert image: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCrop = async (croppedAreaPixels: Area) => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }
    
    if (!SUPPORTED_IMAGE_TYPES.includes(selectedFile.type)) {
      toast.error('Crop only works with image files');
      return;
    }
    
    setIsProcessing(true);
    try {
      const cropped = await cropImage(selectedFile, croppedAreaPixels, 0.9);
      setProcessedFile(cropped);
      
      // Create preview URL
      const url = URL.createObjectURL(cropped);
      setProcessedPreviewUrl(url);
      
      toast.success('Image cropped successfully');
    } catch (error: any) {
      console.error('Crop error:', error);
      toast.error(`Failed to crop image: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSave = async () => {
    if (!processedFile) {
      toast.error('Please process a file first');
      return;
    }
    
    setIsProcessing(true);
    try {
      await uploadDocument(processedFile, 'Processed Documents');
      toast.success('Processed file saved to document wallet');
      
      // Clear the form
      handleClear();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(`Failed to save file: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedFile(null);
    setProcessedPreviewUrl(null);
  };
  
  const handleDownload = () => {
    if (!processedFile || !processedPreviewUrl) {
      toast.error('No processed file to download');
      return;
    }
    
    const a = document.createElement('a');
    a.href = processedPreviewUrl;
    a.download = processedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Document Processor</h2>
        <p className="text-muted-foreground mt-1">
          Resize, crop, convert, and reduce the size of your documents
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileUploader 
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          onClear={handleClear}
          supportedImageTypes={SUPPORTED_IMAGE_TYPES}
        />
        
        <ProcessTabs 
          selectedFile={selectedFile}
          processedFile={processedFile}
          processedPreviewUrl={processedPreviewUrl}
          previewUrl={previewUrl}
          isProcessing={isProcessing}
          supportedImageTypes={SUPPORTED_IMAGE_TYPES}
          onResize={handleResize}
          onCrop={handleCrop}
          onConvert={handleConvert}
          onReduceSize={handleReduceFileSize}
          onSave={handleSave}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};
