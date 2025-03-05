
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConvertTabProps {
  onConvert: (format: 'jpeg' | 'png' | 'webp', quality: number) => void;
  isProcessing: boolean;
  disabled: boolean;
}

export const ConvertTab = ({ onConvert, isProcessing, disabled }: ConvertTabProps) => {
  const [convertFormat, setConvertFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [convertQuality, setConvertQuality] = useState(80);

  const handleConvertClick = () => {
    onConvert(convertFormat, convertQuality);
  };

  return (
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
        onClick={handleConvertClick} 
        disabled={disabled || isProcessing} 
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Convert Image'}
      </Button>
    </div>
  );
};
