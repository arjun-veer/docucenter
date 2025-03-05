
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ResizeTabProps {
  onResize: (width: number, height: number, quality: number) => void;
  isProcessing: boolean;
  disabled: boolean;
}

export const ResizeTab = ({ onResize, isProcessing, disabled }: ResizeTabProps) => {
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [resizeQuality, setResizeQuality] = useState(80);

  const handleResizeClick = () => {
    onResize(resizeWidth, resizeHeight, resizeQuality);
  };

  return (
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
        onClick={handleResizeClick} 
        disabled={disabled || isProcessing} 
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Resize Image'}
      </Button>
    </div>
  );
};
