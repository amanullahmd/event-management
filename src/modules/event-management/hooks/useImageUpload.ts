import { useState, useCallback } from 'react';
import type { ImageUploadResponse } from '../types/image-upload';

/**
 * Upload status states for the image upload hook
 */
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

/**
 * Hook for managing event image upload and deletion.
 * Validates: Requirements 6.6, 6.7, 6.8
 */
export function useImageUpload() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  };

  const uploadImage = useCallback(async (eventId: string, file: File) => {
    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid image format. Allowed: JPEG, PNG, WebP, GIF');
      setStatus('error');
      throw new Error('Invalid image format');
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Image too large. Maximum size: 10MB');
      setStatus('error');
      throw new Error('Image too large');
    }

    setStatus('uploading');
    setError(null);

    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/events/${eventId}/image`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const data: ImageUploadResponse = await response.json();
      setImageUrl(data.url);
      setStatus('success');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed';
      setError(message);
      setStatus('error');
      throw err;
    }
  }, []);

  const deleteImage = useCallback(async (eventId: string) => {
    setError(null);

    const token = getAuthToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/events/${eventId}/image`,
        {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Delete failed with status ${response.status}`);
      }

      setImageUrl(null);
      setStatus('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image deletion failed';
      setError(message);
      setStatus('error');
      throw err;
    }
  }, []);

  return {
    uploadImage,
    deleteImage,
    isUploading: status === 'uploading',
    error,
    imageUrl,
  };
}
