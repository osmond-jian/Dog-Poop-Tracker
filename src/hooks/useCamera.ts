import { useState, useRef, useCallback } from 'react';

interface UseCameraReturn {
  isSupported: boolean;
  isCapturing: boolean;
  captureImage: () => Promise<File | null>;
  error: string | null;
}

export const useCamera = (): UseCameraReturn => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

  const captureImage = useCallback(async (): Promise<File | null> => {
    if (!isSupported) {
      setError('Camera not supported on this device. Please select a photo from your gallery instead.');
      return null;
    }

    try {
      setIsCapturing(true);
      setError(null);

      // Get camera stream with mobile-optimized settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera for better poop photos
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          aspectRatio: { ideal: 16/9 }
        }
      });

      streamRef.current = stream;

      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true; // Important for iOS
      video.muted = true; // Prevent audio issues
      videoRef.current = video;

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Wait a moment for the camera to adjust
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
      }

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());

      // Convert to blob and return as File
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `dog-poop-${Date.now()}.jpg`, {
              type: 'image/jpeg'
            });
            resolve(file);
          } else {
            resolve(null);
          }
        }, 'image/jpeg', 0.8);
      });

    } catch (err) {
      console.error('Camera capture error:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access to take photos of your dog\'s poop for health tracking.');
      } else if (err instanceof Error && err.name === 'NotFoundError') {
        setError('No camera found on this device. Please select a photo from your gallery instead.');
      } else {
        setError('Failed to access camera. Please check permissions or try selecting a photo from your gallery.');
      }
      return null;
    } finally {
      setIsCapturing(false);
      // Clean up stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [isSupported]);

  return {
    isSupported,
    isCapturing,
    captureImage,
    error
  };
};