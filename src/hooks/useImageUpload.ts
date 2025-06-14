import { useState, useCallback } from 'react';
import { getCurrentEndpoint, API_CONFIG } from '../config/api';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<boolean>;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  success: boolean;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const uploadImage = useCallback(async (file: File): Promise<boolean> => {
    // Validate file
    if (!API_CONFIG.ACCEPTED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, or WebP image of your dog\'s poop.');
      return false;
    }

    if (file.size > API_CONFIG.MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 10MB for your dog\'s health photos.');
      return false;
    }

    try {
      setIsUploading(true);
      setError(null);
      setSuccess(false);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      const formData = new FormData();
      formData.append('dogPoopImage', file);
      formData.append('timestamp', new Date().toISOString());
      formData.append('type', 'dog-poop-sample');
      formData.append('petHealthTracking', 'true');

      const endpoint = getCurrentEndpoint();

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            setProgress({
              loaded: event.loaded,
              total: event.total,
              percentage
            });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setSuccess(true);
            setProgress(null);
            resolve(true);
          } else {
            setError(`Upload failed: ${xhr.statusText}. Don't worry, your dog's health tracking is important - please try again!`);
            resolve(false);
          }
        });

        xhr.addEventListener('error', () => {
          setError('Network error occurred during upload. Please check your connection and try again for your pup\'s health tracking.');
          resolve(false);
        });

        xhr.addEventListener('timeout', () => {
          setError('Upload timeout. Please try again - your dog\'s health monitoring is worth the wait!');
          resolve(false);
        });

        xhr.open('POST', endpoint);
        xhr.timeout = API_CONFIG.TIMEOUT;
        
        // Set headers (excluding Content-Type for FormData)
        xhr.setRequestHeader('Accept', 'application/json');
        
        xhr.send(formData);
      });

    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again - your dog\'s health is important to us!');
      return false;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadImage,
    isUploading,
    progress,
    error,
    success
  };
};