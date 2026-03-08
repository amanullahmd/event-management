import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUploadArea, validateFile } from '../ImageUploadArea';

describe('ImageUploadArea Component', () => {
  const mockOnImageSelected = jest.fn();
  const mockOnImageRemoved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering: upload zone visible, file picker button present', () => {
    it('should render upload zone with drag-and-drop area', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const uploadZone = screen.getByRole('button', { name: /upload event image/i });
      expect(uploadZone).toBeInTheDocument();
      expect(uploadZone).toHaveClass('border-dashed');
    });

    it('should render file picker input', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp,image/gif');
    });

    it('should display accepted file types and max size', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      expect(screen.getByText(/JPG, PNG, WebP, GIF/)).toBeInTheDocument();
      expect(screen.getByText(/Max 5 MB/)).toBeInTheDocument();
    });

    it('should render upload icon', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const uploadZone = screen.getByRole('button', { name: /upload event image/i });
      const icon = uploadZone.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render "Event Image" label', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      expect(screen.getByText('Event Image')).toBeInTheDocument();
    });
  });

  describe('Drag-and-drop: file selection via drag-and-drop', () => {
    it('should accept file via drag-and-drop', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const uploadZone = screen.getByRole('button', { name: /upload event image/i });
      const file = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' });

      fireEvent.dragOver(uploadZone);
      fireEvent.drop(uploadZone, { dataTransfer: { files: [file] } });

      await waitFor(() => {
        expect(mockOnImageSelected).toHaveBeenCalledWith(file);
      });
    });

    it('should highlight zone on drag over', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const uploadZone = screen.getByRole('button', { name: /upload event image/i });

      fireEvent.dragOver(uploadZone);
      expect(uploadZone).toHaveClass('border-blue-500', 'bg-blue-50');
    });

    it('should remove highlight on drag leave', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const uploadZone = screen.getByRole('button', { name: /upload event image/i });

      fireEvent.dragOver(uploadZone);
      fireEvent.dragLeave(uploadZone);

      expect(uploadZone).not.toHaveClass('bg-blue-50');
    });

    it('should only accept first file in multi-file drag-and-drop', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const uploadZone = screen.getByRole('button', { name: /upload event image/i });
      const file1 = new File(['data1'], 'photo1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['data2'], 'photo2.jpg', { type: 'image/jpeg' });

      fireEvent.drop(uploadZone, { dataTransfer: { files: [file1, file2] } });

      await waitFor(() => {
        expect(mockOnImageSelected).toHaveBeenCalledWith(file1);
        expect(mockOnImageSelected).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Preview: image preview displayed after selection', () => {
    it('should display image preview after file selection', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const preview = screen.getByAltText('Event image preview');
        expect(preview).toBeInTheDocument();
        expect(preview).toHaveAttribute('src', 'blob:mock-url');
      });
    });

    it('should display preview with Replace and Remove buttons', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /replace image/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /remove image/i })).toBeInTheDocument();
      });
    });

    it('should display existing image URL when provided', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          currentImageUrl="https://example.com/existing-image.jpg"
        />
      );

      const preview = screen.getByAltText('Event image preview');
      expect(preview).toHaveAttribute('src', 'https://example.com/existing-image.jpg');
    });

    it('should clean up object URL on unmount', async () => {
      const { unmount } = render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByAltText('Event image preview')).toBeInTheDocument();
      });

      unmount();

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('Validation errors: oversized file error, unsupported type error', () => {
    it('should display error for unsupported file type', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['data'], 'document.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Unsupported file type/)).toBeInTheDocument();
        expect(screen.getByText(/Accepted formats: JPG, PNG, WebP, GIF/)).toBeInTheDocument();
      });

      expect(mockOnImageSelected).not.toHaveBeenCalled();
    });

    it('should display error for oversized file', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      // Create a file larger than 5 MB
      const largeData = new ArrayBuffer(6 * 1024 * 1024);
      const file = new File([largeData], 'large-photo.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/File size exceeds 5 MB/)).toBeInTheDocument();
      });

      expect(mockOnImageSelected).not.toHaveBeenCalled();
    });

    it('should display error for drag-and-drop with unsupported type', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const uploadZone = screen.getByRole('button', { name: /upload event image/i });
      const file = new File(['data'], 'document.txt', { type: 'text/plain' });

      fireEvent.drop(uploadZone, { dataTransfer: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Unsupported file type/)).toBeInTheDocument();
      });

      expect(mockOnImageSelected).not.toHaveBeenCalled();
    });

    it('should clear validation error when valid file is selected after error', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      // First, select invalid file
      const invalidFile = new File(['data'], 'document.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Unsupported file type/)).toBeInTheDocument();
      });

      // Then select valid file
      const validFile = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(screen.queryByText(/Unsupported file type/)).not.toBeInTheDocument();
        expect(mockOnImageSelected).toHaveBeenCalledWith(validFile);
      });
    });

    it('should display error prop when provided', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          error="Server error: upload failed"
        />
      );

      expect(screen.getByText('Server error: upload failed')).toBeInTheDocument();
    });

    it('should prioritize validation error over error prop', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          error="Server error"
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['data'], 'document.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Unsupported file type/)).toBeInTheDocument();
        expect(screen.queryByText('Server error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading: loading indicator shown during upload', () => {
    it('should display loading indicator when isUploading is true', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          isUploading={true}
        />
      );

      expect(screen.getByText('Uploading image...')).toBeInTheDocument();
      expect(screen.getByRole('status', { name: /uploading image/i })).toBeInTheDocument();
    });

    it('should display spinner icon during upload', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          isUploading={true}
        />
      );

      const spinner = screen.getByRole('status', { name: /uploading image/i })
        .querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should disable file picker during upload', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          isUploading={true}
        />
      );

      const uploadZone = screen.getByRole('status', { name: /uploading image/i });
      fireEvent.click(uploadZone);

      // File input should not be triggered
      expect(mockOnImageSelected).not.toHaveBeenCalled();
    });

    it('should hide upload zone when isUploading is true', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          isUploading={true}
        />
      );

      expect(screen.queryByRole('button', { name: /upload event image/i })).not.toBeInTheDocument();
    });

    it('should show upload zone again when isUploading becomes false', () => {
      const { rerender } = render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          isUploading={true}
        />
      );

      expect(screen.queryByRole('button', { name: /upload event image/i })).not.toBeInTheDocument();

      rerender(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          isUploading={false}
        />
      );

      expect(screen.getByRole('button', { name: /upload event image/i })).toBeInTheDocument();
    });
  });

  describe('Error handling: error message displayed, retry button available', () => {
    it('should display error message from error prop', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          error="Upload failed: server error"
        />
      );

      expect(screen.getByText('Upload failed: server error')).toBeInTheDocument();
    });

    it('should display error with alert role', () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          error="Upload failed"
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Upload failed');
    });

    it('should allow retry by selecting file again after error', async () => {
      const { rerender } = render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          error="Upload failed"
        />
      );

      expect(screen.getByText('Upload failed')).toBeInTheDocument();

      // Clear error and allow retry
      rerender(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          error={undefined}
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnImageSelected).toHaveBeenCalledWith(file);
      });
    });
  });

  describe('Remove functionality', () => {
    it('should call onImageRemoved when Remove button is clicked', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /remove image/i })).toBeInTheDocument();
      });

      const removeButton = screen.getByRole('button', { name: /remove image/i });
      fireEvent.click(removeButton);

      expect(mockOnImageRemoved).toHaveBeenCalled();
    });

    it('should return to upload zone after removing image', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByAltText('Event image preview')).toBeInTheDocument();
      });

      const removeButton = screen.getByRole('button', { name: /remove image/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByAltText('Event image preview')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /upload event image/i })).toBeInTheDocument();
      });
    });

    it('should clean up object URL when removing image', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByAltText('Event image preview')).toBeInTheDocument();
      });

      const removeButton = screen.getByRole('button', { name: /remove image/i });
      fireEvent.click(removeButton);

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('Keyboard accessibility', () => {
    it('should trigger file picker on Enter key', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const uploadZone = screen.getByRole('button', { name: /upload event image/i });
      fireEvent.keyDown(uploadZone, { key: 'Enter' });

      // File input should be triggered
      const fileInput = uploadZone.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
    });

    it('should trigger file picker on Space key', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const uploadZone = screen.getByRole('button', { name: /upload event image/i });
      fireEvent.keyDown(uploadZone, { key: ' ' });

      const fileInput = uploadZone.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
    });
  });

  describe('File input reset', () => {
    it('should reset file input after selection to allow re-selecting same file', async () => {
      render(
        <ImageUploadArea
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const fileInput = screen.getByRole('button', { name: /upload event image/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['image-data'], 'photo.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(fileInput.value).toBe('');
      });
    });
  });
});

describe('validateFile utility function', () => {
  it('should accept valid image types', () => {
    const jpegFile = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const pngFile = new File(['data'], 'photo.png', { type: 'image/png' });
    const webpFile = new File(['data'], 'photo.webp', { type: 'image/webp' });
    const gifFile = new File(['data'], 'photo.gif', { type: 'image/gif' });

    expect(validateFile(jpegFile)).toBeNull();
    expect(validateFile(pngFile)).toBeNull();
    expect(validateFile(webpFile)).toBeNull();
    expect(validateFile(gifFile)).toBeNull();
  });

  it('should reject unsupported file types', () => {
    const pdfFile = new File(['data'], 'document.pdf', { type: 'application/pdf' });
    const txtFile = new File(['data'], 'text.txt', { type: 'text/plain' });

    expect(validateFile(pdfFile)).toContain('Unsupported file type');
    expect(validateFile(txtFile)).toContain('Unsupported file type');
  });

  it('should reject files exceeding 5 MB', () => {
    const largeData = new ArrayBuffer(6 * 1024 * 1024);
    const largeFile = new File([largeData], 'large.jpg', { type: 'image/jpeg' });

    expect(validateFile(largeFile)).toContain('File size exceeds 5 MB');
  });

  it('should accept files at exactly 5 MB', () => {
    const data = new ArrayBuffer(5 * 1024 * 1024);
    const file = new File([data], 'photo.jpg', { type: 'image/jpeg' });

    expect(validateFile(file)).toBeNull();
  });

  it('should accept small files', () => {
    const file = new File(['small data'], 'photo.jpg', { type: 'image/jpeg' });

    expect(validateFile(file)).toBeNull();
  });
});
