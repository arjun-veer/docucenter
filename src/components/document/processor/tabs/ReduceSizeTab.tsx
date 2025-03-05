
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ReduceSizeTabProps {
  onReduceSize: (targetSizeKB: number) => void;
  isProcessing: boolean;
  disabled: boolean;
}

export const ReduceSizeTab = ({ onReduceSize, isProcessing, disabled }: ReduceSizeTabProps) => {
  const [targetSizeKB, setTargetSizeKB] = useState(500);

  const handleReduceSizeClick = () => {
    onReduceSize(targetSizeKB);
  };

  return (
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
        onClick={handleReduceSizeClick} 
        disabled={disabled || isProcessing} 
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Reduce File Size'}
      </Button>
      
      <p className="text-xs text-muted-foreground italic">
        Note: Size reduction works best with image files. For PDFs and other document types, 
        server-side processing would provide better results.
      </p>
    </div>
  );
};
