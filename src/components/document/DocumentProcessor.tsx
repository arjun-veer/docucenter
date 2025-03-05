import { useState, useRef, useEffect } from 'react';
import { useDocuments } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { resizeImage, cropImage, convertImageFormat, validateFile, formatFileSize, SUPPORTED_IMAGE_TYPES } from '@/lib/fileUtils';
import { Upload, Image as ImageIcon, CropIcon, FileType, Save, RefreshCw, Trash, FileText } from 'lucide-react';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';

export const DocumentProcessor = () => {
  const { uploadDocument } = useDocuments();
  const [activeTab, setActiveTab] = useState('resize');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [processedPreviewUrl, setProcessedPreviewUrl] = useState<string | null>(null);
  
  // Resize settings
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [resizeQuality, setResizeQuality] = useState(80);
  
  // Convert settings
  const [convertFormat, setConvertFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [convertQuality, setConvertQuality] = useState(80);
  
  // Crop settings
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  // Size reduction settings
  const [targetSizeKB, setTargetSizeKB] = useState(500); // Default target size: 500KB
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // When component mounts, check if we have a dark theme
  useEffect(() => {
    // This effect will run when the component mounts
    // and will detect if we have a dark theme
    const isDarkMode = document.documentElement.classList.contains('dark');
    // You could use this to adjust your UI if needed
  }, []);
  
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
    
    // Reset processed state
    setProcessedFile(null);
    setProcessedPreviewUrl(null);
  };
  
  const handleResize = async () => {
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
      const resized = await resizeImage(selectedFile, resizeWidth, resizeHeight, resizeQuality / 100);
      setProcessedFile(resized);
      
      // Create preview URL
      const url = URL.createObjectURL(resized);
      setProcessedPreviewUrl(url);
      
      toast.success(`Image resized to ${resizeWidth} x ${resizeHeight}`);
    } catch (error: any) {
      console.error('Resize error:', error);
      toast.error(`Failed to resize image: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReduceFileSize = async () => {
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
      
      toast.success(`File reduced to ${formatFileSize(processedFile.size)}`);
    } catch (error: any) {
      console.error('Size reduction error:', error);
      toast.error(`Failed to reduce file size: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleConvert = async () => {
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
      const converted = await convertImageFormat(selectedFile, convertFormat, convertQuality / 100);
      setProcessedFile(converted);
      
      // Create preview URL
      const url = URL.createObjectURL(converted);
      setProcessedPreviewUrl(url);
      
      toast.success(`Image converted to ${convertFormat.toUpperCase()}`);
    } catch (error: any) {
      console.error('Convert error:', error);
      toast.error(`Failed to convert image: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCrop = async () => {
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
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
  
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
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
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Input File</CardTitle>
            <CardDescription>
              Upload a file to process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {previewUrl ? (
                SUPPORTED_IMAGE_TYPES.includes(selectedFile?.type || '') ? (
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
                onClick={handleClear}
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
        
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Process File</CardTitle>
            <CardDescription>
              Select an operation to perform
            </CardDescription>
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
                <TabsTrigger value="resize">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    Resize
                  </span>
                </TabsTrigger>
                <TabsTrigger value="crop">
                  <span className="flex items-center gap-1">
                    <CropIcon className="h-4 w-4" />
                    Crop
                  </span>
                </TabsTrigger>
                <TabsTrigger value="convert">
                  <span className="flex items-center gap-1">
                    <FileType className="h-4 w-4" />
                    Convert
                  </span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="size" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Size (KB)</label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        value={[targetSizeKB]} 
                        min={2} 
                        max={2000} 
                        step={10}
                        onValueChange={(value) => setTargetSizeKB(value[0])}
                        className="flex-1"
                      />
                      <span className="text-sm w-16 text-right">{targetSizeKB} KB</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set your target file size in KB. The processor will try to reduce your file to this size or smaller.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleReduceFileSize} 
                    disabled={!selectedFile || isProcessing} 
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Reduce File Size'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground italic">
                    Note: Size reduction works best with image files. For PDFs and other document types, 
                    server-side processing would provide better results.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="resize" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Width</label>
                      <div className="flex items-center gap-2">
                        <Slider 
                          value={[resizeWidth]} 
                          min={50} 
                          max={2000} 
                          step={10}
                          onValueChange={(value) => setResizeWidth(value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">{resizeWidth}px</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Height</label>
                      <div className="flex items-center gap-2">
                        <Slider 
                          value={[resizeHeight]} 
                          min={50} 
                          max={2000} 
                          step={10}
                          onValueChange={(value) => setResizeHeight(value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">{resizeHeight}px</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quality</label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        value={[resizeQuality]} 
                        min={10} 
                        max={100} 
                        step={5}
                        onValueChange={(value) => setResizeQuality(value[0])}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-right">{resizeQuality}%</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleResize} 
                    disabled={!selectedFile || isProcessing} 
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Resize Image'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="crop" className="space-y-4">
                <div className="space-y-4">
                  <div className="relative w-full h-64 bg-gray-200 dark:bg-gray-800">
                    <Cropper
                      image={previewUrl}
                      crop={crop}
                      zoom={zoom}
                      aspect={4 / 3}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCrop} 
                    disabled={!selectedFile || isProcessing} 
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Crop Image'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="convert" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Output Format</label>
                    <Select 
                      value={convertFormat} 
                      onValueChange={(value: 'jpeg' | 'png' | 'webp') => setConvertFormat(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quality</label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        value={[convertQuality]} 
                        min={10} 
                        max={100} 
                        step={5}
                        onValueChange={(value) => setConvertQuality(value[0])}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-right">{convertQuality}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Note: Quality only applies to JPEG and WebP formats.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleConvert} 
                    disabled={!selectedFile || isProcessing} 
                    className="w-full"
                  >
                    {isProcessing ? 'Processing...' : 'Convert Image'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            {processedPreviewUrl && (
              <div className="mt-4 space-y-4">
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <h3 className="font-medium mb-2">Processed File</h3>
                  {SUPPORTED_IMAGE_TYPES.includes(processedFile?.type || '') ? (
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
                    onClick={handleDownload}
                    className="flex-1"
                  >
                    Download
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save to Documents
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
