
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';

interface CropTabProps {
  previewUrl: string | null;
  onCrop: (croppedAreaPixels: Area) => void;
  isProcessing: boolean;
  disabled: boolean;
}

export const CropTab = ({ previewUrl, onCrop, isProcessing, disabled }: CropTabProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropClick = () => {
    if (croppedAreaPixels) {
      onCrop(croppedAreaPixels);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full h-64 bg-gray-200 dark:bg-gray-800">
        {previewUrl && (
          <Cropper
            image={previewUrl}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        )}
      </div>
      
      <Button 
        onClick={handleCropClick} 
        disabled={disabled || isProcessing} 
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Crop Image'}
      </Button>
    </div>
  );
};
