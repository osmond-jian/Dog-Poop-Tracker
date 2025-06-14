import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Image as ImageIcon, X, Check, AlertCircle, Heart } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { useImageUpload } from '../hooks/useImageUpload';

const ImageUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isSupported: cameraSupported, isCapturing, captureImage, error: cameraError } = useCamera();
  const { uploadImage, isUploading, progress, error: uploadError, success } = useImageUpload();

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = async () => {
    const file = await captureImage();
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const success = await uploadImage(selectedFile);
      if (success) {
        // Clear selection after successful upload
        setTimeout(() => {
          setSelectedFile(null);
          setPreviewUrl(null);
        }, 2000);
      }
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentError = cameraError || uploadError;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 touch-manipulation
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${selectedFile ? 'border-green-500 bg-green-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Dog poop sample preview"
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors touch-manipulation"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-600">📷 {selectedFile?.name}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-green-100 rounded-full">
                <ImageIcon size={32} className="text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                🐕 Upload Your Dog's Sample
              </p>
              <p className="text-sm text-gray-600">
                Tap to select a photo or drag and drop here
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        {cameraSupported && (
          <button
            onClick={handleCameraCapture}
            disabled={isCapturing}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors disabled:opacity-50 touch-manipulation"
            style={{ minHeight: '56px' }}
          >
            <Camera size={20} />
            {isCapturing ? 'Taking Photo...' : '📸 Camera'}
          </button>
        )}
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-4 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-medium transition-colors touch-manipulation"
          style={{ minHeight: '56px' }}
        >
          <Upload size={20} />
          📱 Select Photo
        </button>
      </div>

      {/* Upload Button */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={isUploading || success}
          className={`
            w-full mt-4 py-4 px-4 rounded-xl font-medium transition-all duration-300 touch-manipulation
            ${success 
              ? 'bg-green-600 text-white' 
              : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white disabled:opacity-50'
            }
          `}
          style={{ minHeight: '56px' }}
        >
          <div className="flex items-center justify-center gap-2">
            {success ? (
              <>
                <Check size={20} />
                🎉 Upload Successful! Good job tracking your pup's health!
              </>
            ) : isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Uploading your dog's sample...
              </>
            ) : (
              <>
                <Heart size={20} />
                🐾 Upload for Your Dog's Health
              </>
            )}
          </div>
        </button>
      )}

      {/* Progress Bar */}
      {progress && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>🚀 Uploading your pup's photo...</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {currentError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">Oops! Something went wrong</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{currentError}</p>
          <p className="text-xs text-red-600 mt-2">Don't worry - your dog's health tracking is important to us!</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;