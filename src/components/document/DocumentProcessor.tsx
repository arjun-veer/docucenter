
import { useState, useRef } from 'react';
import { useDocuments } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { resizeImage, cropImage, convertImageFormat, validateFile, formatFileSize, SUPPORTED_IMAGE_TYPES } from '@/lib/fileUtils';
import { Upload, Image as ImageIcon, CropIcon, FileType, Save, RefreshCw, Trash } from 'lucide-react';
import { toast } from 'sonner';

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
  
  // Crop settings - will be expanded in a real implementation
  // For simplicity, we'll use a fixed crop area for now
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(300);
  const [cropHeight, setCropHeight] = useState(300);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate the file
    const validation = validateFile(file, SUPPORTED_IMAGE_TYPES);
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
    
    // Set default crop dimensions based on image
    const img = new window.Image();
    img.onload = () => {
      setCropWidth(Math.min(300, img.width));
      setCropHeight(Math.min(300, img.height));
    };
    img.src = url;
  };
  
  const handleResize = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
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
  
  const handleConvert = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
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
    
    setIsProcessing(true);
    try {
      const cropped = await cropImage(
        selectedFile, 
        { x: cropX, y: cropY, width: cropWidth, height: cropHeight }, 
        0.9
      );
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
      toast.error('Please process an image first');
      return;
    }
    
    setIsProcessing(true);
    try {
      await uploadDocument(processedFile, 'Processed Images');
      toast.success('Processed image saved to document wallet');
      
      // Clear the form
      handleClear();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(`Failed to save image: ${error.message}`);
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
      toast.error('No processed image to download');
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
          Resize, crop, and convert your images
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Input Image</CardTitle>
            <CardDescription>
              Upload an image to process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Input preview" 
                  className="max-w-full max-h-[200px] object-contain mb-4"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground py-6">
                  <Upload className="h-10 w-10 mb-2" />
                  <p>Click to upload an image</p>
                  <p className="text-xs mt-1">JPG, PNG or WebP</p>
                </div>
              )}
              
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/jpg,image/png,image/webp"
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
            <CardTitle>Process Image</CardTitle>
            <CardDescription>
              Select an operation to perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">X Position</label>
                      <div className="flex items-center gap-2">
                        <Slider 
                          value={[cropX]} 
                          min={0} 
                          max={1000} 
                          step={10}
                          onValueChange={(value) => setCropX(value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">{cropX}px</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Y Position</label>
                      <div className="flex items-center gap-2">
                        <Slider 
                          value={[cropY]} 
                          min={0} 
                          max={1000} 
                          step={10}
                          onValueChange={(value) => setCropY(value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">{cropY}px</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Width</label>
                      <div className="flex items-center gap-2">
                        <Slider 
                          value={[cropWidth]} 
                          min={50} 
                          max={1000} 
                          step={10}
                          onValueChange={(value) => setCropWidth(value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">{cropWidth}px</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Height</label>
                      <div className="flex items-center gap-2">
                        <Slider 
                          value={[cropHeight]} 
                          min={50} 
                          max={1000} 
                          step={10}
                          onValueChange={(value) => setCropHeight(value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">{cropHeight}px</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground italic">
                    Note: For a production app, a visual crop tool would be implemented here.
                  </p>
                  
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
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Processed Image</h3>
                  <img 
                    src={processedPreviewUrl} 
                    alt="Processed preview" 
                    className="max-w-full max-h-[250px] object-contain mx-auto"
                  />
                  
                  {processedFile && (
                    <div className="text-sm text-muted-foreground mt-2">
                      <p><strong>Size:</strong> {formatFileSize(processedFile.size)}</p>
                      <p><strong>Type:</strong> {processedFile.type}</p>
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
