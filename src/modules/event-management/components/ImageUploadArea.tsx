'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
} from '../types/image-upload';

interface ImageUploadAreaProps {
  onImageSelected: (file: File) => void;
  onImageRemoved: () => void;
  currentImageUrl?: string;
  error?: string;
  isUploading?: boolean;
}

function getFileExtensions(): string {
  return 'JPG, PNG, WebP, GIF';
}

export function validateFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return `Unsupported file type. Accepted formats: ${getFileExtensions()}`;
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `File size exceeds ${MAX_IMAGE_SIZE_LABEL}. Please choose a smaller file.`;
  }
  return null;
}

export const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  onImageSelected,
  onImageRemoved,
  currentImageUrl,
  error,
  isUploading = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFile = useCallback(
    (file: File) => {
      setValidationError(null);
      const errorMsg = validateFile(file);
      if (errorMsg) {
        setValidationError(errorMsg);
        return;
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      onImageSelected(file);
    },
    [onImageSelected, previewUrl]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFile]
  );

  const handleClickZone = useCallback(() => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  }, [isUploading]);

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setValidationError(null);
    onImageRemoved();
  }, [onImageRemoved, previewUrl]);

  const displayError = validationError || error;
  const displayImageUrl = previewUrl || currentImageUrl;

  // Loading state
  if (isUploading) {
    return (
      <div className="w-full" role="status" aria-label="Uploading image">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Image
        </label>
        <div className="flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg p-8">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-600">Uploading image...</p>
        </div>
      </div>
    );
  }

  // Image preview state (either selected file or existing image)
  if (displayImageUrl) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Image
        </label>
        <div className="relative border border-gray-300 rounded-lg overflow-hidden">
          <img
            src={displayImageUrl}
            alt="Event image preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={handleClickZone}
              className="px-3 py-1 bg-white text-gray-700 text-sm rounded shadow hover:bg-gray-100"
              aria-label="Replace image"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded shadow hover:bg-red-700"
              aria-label="Remove image"
            >
              Remove
            </button>
          </div>
        </div>
        {displayError && (
          <p className="mt-1 text-sm text-red-600" role="alert">{displayError}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>
    );
  }

  // Default drop zone state
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Event Image
      </label>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload event image"
        onClick={handleClickZone}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClickZone();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <svg
          className="h-10 w-10 text-gray-400 mb-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm text-gray-600">
          Drag and drop an image, or <span className="text-blue-600 font-medium">browse</span>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {getFileExtensions()} — Max {MAX_IMAGE_SIZE_LABEL}
        </p>
      </div>
      {displayError && (
        <p className="mt-1 text-sm text-red-600" role="alert">{displayError}</p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
};

export default ImageUploadArea;
