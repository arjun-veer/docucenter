// File size constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const IMAGE_MAX_DIMENSION = 1600;
export const IMAGE_PREVIEW_DIMENSION = 300;

// Supported file types
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const SUPPORTED_DOCUMENT_TYPES = [...SUPPORTED_IMAGE_TYPES, 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

/**
 * Validates a file based on type and size
 */
export const validateFile = (file: File, supportedTypes: string[] = SUPPORTED_DOCUMENT_TYPES, maxSize: number = MAX_FILE_SIZE): { valid: boolean; error?: string } => {
  if (!supportedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Unsupported file type. Supported types: ${supportedTypes.map(type => type.split('/')[1]).join(', ')}` 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File too large. Maximum size is ${(maxSize / (1024 * 1024)).toFixed(1)}MB` 
    };
  }
  
  return { valid: true };
};

/**
 * Resizes an image file while maintaining aspect ratio
 */
export const resizeImage = async (file: File, maxWidth: number = IMAGE_MAX_DIMENSION, maxHeight: number = IMAGE_MAX_DIMENSION, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      reject(new Error('Not an image file'));
      return;
    }
    
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw and resize image on canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert canvas to blob
      let outputType = file.type;
      // If it's PNG and too large, convert to JPEG for better compression
      if (file.type === 'image/png' && file.size > 2 * 1024 * 1024) {
        outputType = 'image/jpeg';
      }
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        
        // Create new file from blob
        const resizedFile = new File([blob], file.name, {
          type: outputType,
          lastModified: Date.now()
        });
        
        resolve(resizedFile);
      }, outputType, quality);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Crop an image based on specified coordinates
 */
export const cropImage = async (file: File, cropArea: { x: number, y: number, width: number, height: number }, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      reject(new Error('Not an image file'));
      return;
    }
    
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Create canvas for cropping
      const canvas = document.createElement('canvas');
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      // Draw cropped image on canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      );
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        
        // Create new file from blob
        const outputName = file.name.replace(/\.[^/.]+$/, "") + "_cropped" + file.name.substring(file.name.lastIndexOf('.'));
        const croppedFile = new File([blob], outputName, {
          type: file.type,
          lastModified: Date.now()
        });
        
        resolve(croppedFile);
      }, file.type, quality);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Convert image from one format to another
 */
export const convertImageFormat = async (file: File, toFormat: 'jpeg' | 'png' | 'webp', quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      reject(new Error('Not an image file'));
      return;
    }
    
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Create canvas for conversion
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      // Set output mime type
      let mimeType: string;
      let extension: string;
      
      switch (toFormat) {
        case 'jpeg':
          mimeType = 'image/jpeg';
          extension = '.jpg';
          break;
        case 'png':
          mimeType = 'image/png';
          extension = '.png';
          break;
        case 'webp':
          mimeType = 'image/webp';
          extension = '.webp';
          break;
        default:
          reject(new Error('Unsupported output format'));
          return;
      }
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        
        // Create new file name without the old extension
        const fileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newFileName = `${fileName}${extension}`;
        
        // Create new file from blob
        const convertedFile = new File([blob], newFileName, {
          type: mimeType,
          lastModified: Date.now()
        });
        
        resolve(convertedFile);
      }, mimeType, quality);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Generate a thumbnail preview for an image
 */
export const generateImageThumbnail = async (file: File, size: number = IMAGE_PREVIEW_DIMENSION): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      reject(new Error('Not an image file'));
      return;
    }
    
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Calculate thumbnail dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        height = Math.round((height * size) / width);
        width = size;
      } else {
        width = Math.round((width * size) / height);
        height = size;
      }
      
      // Create canvas for thumbnail
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw image on canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(dataUrl);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Calculate the file size in a human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Compress a PDF file to a target size
 */
export const compressPdf = async (file: File, targetSizeBytes: number): Promise<File> => {
  // Implement the logic to compress PDF file
  // This is a placeholder implementation
  return file;
};
