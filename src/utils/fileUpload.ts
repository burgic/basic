// src/utils/fileUpload.ts

/**
 * Validates a file against specified constraints
 * @param file - The file to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateFile = (
    file: File, 
    options: {
      maxSizeInBytes?: number;
      allowedTypes?: string[];
    } = {}
  ): { 
    valid: boolean; 
    errors: string[]; 
  } => {
    const { 
      maxSizeInBytes = 10 * 1024 * 1024, // Default 10MB
      allowedTypes = [] 
    } = options;
  
    const errors: string[] = [];
  
    // Check file size
    if (file.size > maxSizeInBytes) {
      errors.push(`File size exceeds the maximum of ${maxSizeInBytes / (1024 * 1024)}MB`);
    }
  
    // Check file type if allowed types are specified
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  
    return {
      valid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Converts a file to a base64 encoded string
   * @param file - The file to convert
   * @returns A promise resolving to the base64 encoded string
   */
  export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  };
  
  /**
   * Converts a base64 string back to a File
   * @param base64String - The base64 encoded string
   * @param filename - The name of the file
   * @param mimeType - The MIME type of the file
   * @returns A File object
   */
  export const base64ToFile = (
    base64String: string, 
    filename: string, 
    mimeType: string
  ): File => {
    // Remove the data URL prefix if present
    const base64Data = base64String.split(',')[1] || base64String;
    
    // Convert base64 to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    
    // Create a blob from the byte array
    const blob = new Blob([byteArray], { type: mimeType });
    
    // Create a File from the blob
    return new File([blob], filename, { type: mimeType });
  };
  
  /**
   * Generates a preview URL for an image file
   * @param file - The image file
   * @returns A promise resolving to the preview URL
   */
  export const generateImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Only generate preview for image files
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'));
        return;
      }
  
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to generate preview'));
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  };
  
  /**
   * Compresses an image file
   * @param file - The image file to compress
   * @param quality - Compression quality (0-1)
   * @param maxWidth - Maximum width of the compressed image
   * @returns A promise resolving to the compressed file
   */
  export const compressImage = async (
    file: File, 
    quality: number = 0.7, 
    maxWidth: number = 1920
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }
        
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          
          // Create a new File from the blob
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          
          resolve(compressedFile);
        }, file.type, quality);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // Load the image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };