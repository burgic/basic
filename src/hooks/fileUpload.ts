// src/hooks/useFileUpload.ts
import { useState, useCallback } from 'react';

/**
 * Converts a File to a Base64 encoded string
 * @param file - The file to convert
 * @returns A promise that resolves to a base64 encoded string
 */
const fileToBase64 = (file: File): Promise<string> => {
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

interface UseFileUploadOptions {
  maxSizeInBytes?: number;
  acceptedFileTypes?: string[];
  multiple?: boolean;
  onUploadStart?: () => void;
  onUploadSuccess?: (result: string | string[]) => void;
  onUploadError?: (error: Error) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    maxSizeInBytes = 10 * 1024 * 1024, // 10MB default
    acceptedFileTypes = [],
    multiple = false,
    onUploadStart,
    onUploadSuccess,
    onUploadError
  } = options;
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset previous state
    setError(null);
    
    // Get selected files
    const selectedFiles = e.target.files 
      ? Array.from(e.target.files) 
      : [];
    
    // Validate files
    const validationErrors = selectedFiles.map(validateFile);
    const hasErrors = validationErrors.some(result => !result.valid);
    
    if (hasErrors) {
      const errorMessages = validationErrors
        .filter(result => !result.valid)
        .flatMap(result => result.errors);
      
      setError(errorMessages.join(', '));
      return;
    }
    
    // Generate previews
    const newPreviews = selectedFiles.map(file => 
      file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : ''
    );
    
    // Update state
    setFiles(multiple ? selectedFiles : [selectedFiles[0]]);
    setPreviews(multiple ? newPreviews : [newPreviews[0]]);
  }, [multiple]);

  const uploadFile = useCallback(async () => {
    if (!files.length) {
      setError('No file selected');
      return null;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Call upload start callback
      onUploadStart?.();
      
      // Convert files to base64
      const base64Results = await Promise.all(
        files.map(file => fileToBase64(file))
      );
      
      // Call success callback
      onUploadSuccess?.(multiple ? base64Results : base64Results[0]);
      
      return multiple ? base64Results : base64Results[0];
    } catch (err) {
      const error = err instanceof Error 
        ? err 
        : new Error('File upload failed');
      
      setError(error.message);
      onUploadError?.(error);
      
      return null;
    } finally {
      setUploading(false);
    }
  }, [files, multiple, onUploadStart, onUploadSuccess, onUploadError]);

  const reset = useCallback(() => {
    setFiles([]);
    setPreviews([]);
    setError(null);
    setUploading(false);
  }, []);

  const validateFile = useCallback((file: File) => {
    const errors: string[] = [];
    
    // Check file size
    if (file.size > maxSizeInBytes) {
      errors.push(`File size exceeds ${maxSizeInBytes / (1024 * 1024)}MB`);
    }
    
    // Check file type
    if (acceptedFileTypes.length > 0 && !acceptedFileTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }, [maxSizeInBytes, acceptedFileTypes]);

  return {
    files,
    previews,
    error,
    uploading,
    handleFileChange,
    uploadFile,
    reset,
    validateFile
  };
};