import { renderHook, act } from '@testing-library/react';
import { useImageUpload } from '../useImageUpload';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useImageUpload', () => {
  const eventId = 'event-123';
  const mockFile = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' });
  const mockResponse = {
    id: 'img-1',
    url: 'https://bucket.s3.amazonaws.com/events/event-123/uuid.jpg',
    storageKey: 'events/event-123/uuid.jpg',
    fileSize: 1024,
    contentType: 'image/jpeg',
    originalFilename: 'photo.jpg',
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with idle state', () => {
      const { result } = renderHook(() => useImageUpload());

      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.imageUrl).toBeNull();
    });
  });

  describe('uploadImage - state transitions', () => {
    it('should transition from idle to uploading to success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useImageUpload());

      // Initial state: idle
      expect(result.current.isUploading).toBe(false);

      let uploadPromise: Promise<any>;
      await act(async () => {
        uploadPromise = result.current.uploadImage(eventId, mockFile);
        // At this point, should be uploading
        expect(result.current.isUploading).toBe(true);
        await uploadPromise;
      });

      // After success: not uploading, no error, imageUrl set
      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.imageUrl).toBe(mockResponse.url);
    });

    it('should transition from idle to uploading to error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid file type' }),
      });

      const { result } = renderHook(() => useImageUpload());

      // Initial state: idle
      expect(result.current.isUploading).toBe(false);

      await act(async () => {
        try {
          await result.current.uploadImage(eventId, mockFile);
        } catch {
          // expected
        }
      });

      // After error: not uploading, error set, imageUrl null
      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toBe('Invalid file type');
      expect(result.current.imageUrl).toBeNull();
    });

    it('should clear error when starting new upload after previous error', async () => {
      // First upload fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid file type' }),
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.uploadImage(eventId, mockFile);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Invalid file type');

      // Second upload succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await act(async () => {
        await result.current.uploadImage(eventId, mockFile);
      });

      // Error should be cleared
      expect(result.current.error).toBeNull();
      expect(result.current.imageUrl).toBe(mockResponse.url);
    });
  });

  describe('uploadImage - FormData construction', () => {
    it('should construct FormData with file correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.uploadImage(eventId, mockFile);
      });

      const callArgs = mockFetch.mock.calls[0];
      const formData = callArgs[1].body as FormData;

      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get('file')).toBe(mockFile);
    });

    it('should send POST request to correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.uploadImage(eventId, mockFile);
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain(`/api/events/${eventId}/image`);
      expect(callArgs[1].method).toBe('POST');
    });

    it('should include authorization header with token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.uploadImage(eventId, mockFile);
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers).toEqual({ Authorization: 'Bearer test-token' });
    });

    it('should handle different file types in FormData', async () => {
      const pngFile = new File(['png-data'], 'image.png', { type: 'image/png' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockResponse, originalFilename: 'image.png' }),
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.uploadImage(eventId, pngFile);
      });

      const callArgs = mockFetch.mock.calls[0];
      const formData = callArgs[1].body as FormData;
      expect(formData.get('file')).toBe(pngFile);
    });
  });

  describe('uploadImage - API response handling', () => {
    it('should return complete response data on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useImageUpload());

      let returnedData: any;
      await act(async () => {
        returnedData = await result.current.uploadImage(eventId, mockFile);
      });

      expect(returnedData).toEqual(mockResponse);
      expect(returnedData.id).toBe('img-1');
      expect(returnedData.url).toBe(mockResponse.url);
      expect(returnedData.fileSize).toBe(1024);
    });

    it('should handle 400 Bad Request error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid file type' }),
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.uploadImage(eventId, mockFile);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Invalid file type');
    });

    it('should handle 413 Payload Too Large error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
        json: async () => ({ message: 'File size exceeds maximum allowed size of 5 MB' }),
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.uploadImage(eventId, mockFile);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('File size exceeds maximum allowed size of 5 MB');
    });

    it('should handle 500 Internal Server Error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Storage error' }),
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.uploadImage(eventId, mockFile);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Storage error');
    });

    it('should use generic error message when response has no message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.uploadImage(eventId, mockFile);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Upload failed with status 500');
    });

    it('should handle JSON parse error in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.uploadImage(eventId, mockFile);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Upload failed with status 500');
    });
  });

  describe('uploadImage - error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.uploadImage(eventId, mockFile);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.isUploading).toBe(false);
    });

    it('should handle fetch timeout', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.uploadImage(eventId, mockFile);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Request timeout');
    });

    it('should throw error after setting error state', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useImageUpload());

      let thrownError: Error | null = null;
      await act(async () => {
        try {
          await result.current.uploadImage(eventId, mockFile);
        } catch (err) {
          thrownError = err as Error;
        }
      });

      expect(thrownError).not.toBeNull();
      expect(thrownError?.message).toBe('Network error');
    });
  });

  describe('deleteImage - flow', () => {
    it('should delete image and clear imageUrl on success', async () => {
      // First upload an image
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.uploadImage(eventId, mockFile);
      });

      expect(result.current.imageUrl).not.toBeNull();

      // Now delete
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      await act(async () => {
        await result.current.deleteImage(eventId);
      });

      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.stringContaining(`/api/events/${eventId}/image`),
        expect.objectContaining({
          method: 'DELETE',
          headers: { Authorization: 'Bearer test-token' },
        })
      );

      expect(result.current.imageUrl).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should transition to idle state after successful delete', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.deleteImage(eventId);
      });

      expect(result.current.isUploading).toBe(false);
    });

    it('should send DELETE request to correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.deleteImage(eventId);
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain(`/api/events/${eventId}/image`);
      expect(callArgs[1].method).toBe('DELETE');
    });

    it('should include authorization header in delete request', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.deleteImage(eventId);
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers).toEqual({ Authorization: 'Bearer test-token' });
    });
  });

  describe('deleteImage - error handling', () => {
    it('should set error on delete failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Storage error' }),
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.deleteImage(eventId);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Storage error');
    });

    it('should handle 404 Not Found on delete', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Image not found' }),
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.deleteImage(eventId);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Image not found');
    });

    it('should handle network error on delete', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.deleteImage(eventId);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Image deletion failed');
    });

    it('should throw error after setting error state on delete', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useImageUpload());

      let thrownError: Error | null = null;
      await act(async () => {
        try {
          await result.current.deleteImage(eventId);
        } catch (err) {
          thrownError = err as Error;
        }
      });

      expect(thrownError).not.toBeNull();
    });

    it('should clear error when delete succeeds after previous error', async () => {
      // First delete fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Storage error' }),
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.deleteImage(eventId);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Storage error');

      // Second delete succeeds
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      await act(async () => {
        await result.current.deleteImage(eventId);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('auth token handling', () => {
    it('should send request without auth header when no token', async () => {
      localStorage.clear();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.uploadImage(eventId, mockFile);
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers).toEqual({});
    });

    it('should send delete request without auth header when no token', async () => {
      localStorage.clear();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.deleteImage(eventId);
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers).toEqual({});
    });

    it('should retrieve token from localStorage', async () => {
      const customToken = 'custom-test-token-12345';
      localStorage.setItem('token', customToken);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.uploadImage(eventId, mockFile);
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers).toEqual({ Authorization: `Bearer ${customToken}` });
    });
  });

  describe('multiple uploads', () => {
    it('should handle sequential uploads', async () => {
      const file1 = new File(['data1'], 'image1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['data2'], 'image2.png', { type: 'image/png' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockResponse, originalFilename: 'image1.jpg' }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockResponse, originalFilename: 'image2.png' }),
      });

      const { result } = renderHook(() => useImageUpload());

      let firstUrl: string;
      await act(async () => {
        const data1 = await result.current.uploadImage(eventId, file1);
        firstUrl = data1.url;
      });

      let secondUrl: string;
      await act(async () => {
        const data2 = await result.current.uploadImage(eventId, file2);
        secondUrl = data2.url;
      });

      // Should have the second URL
      expect(result.current.imageUrl).toBe(secondUrl);
      expect(firstUrl).toBe(secondUrl); // In this mock they're the same
    });

    it('should handle upload after delete', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.uploadImage(eventId, mockFile);
      });

      expect(result.current.imageUrl).not.toBeNull();

      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      await act(async () => {
        await result.current.deleteImage(eventId);
      });

      expect(result.current.imageUrl).toBeNull();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await act(async () => {
        await result.current.uploadImage(eventId, mockFile);
      });

      expect(result.current.imageUrl).toBe(mockResponse.url);
    });
  });

  describe('edge cases', () => {
    it('should handle very large file names', async () => {
      const longFileName = 'a'.repeat(500) + '.jpg';
      const largeNameFile = new File(['data'], longFileName, { type: 'image/jpeg' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockResponse, originalFilename: longFileName }),
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.uploadImage(eventId, largeNameFile);
      });

      expect(result.current.imageUrl).toBe(mockResponse.url);
    });

    it('should handle special characters in event ID', async () => {
      const specialEventId = 'event-123-abc_def.xyz';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        await result.current.uploadImage(specialEventId, mockFile);
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain(`/api/events/${specialEventId}/image`);
    });

    it('should handle empty error message from server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: '' }),
      });

      const { result } = renderHook(() => useImageUpload());

      await act(async () => {
        try {
          await result.current.uploadImage(eventId, mockFile);
        } catch {
          // expected
        }
      });

      expect(result.current.error).toBe('Upload failed with status 400');
    });
  });
});
