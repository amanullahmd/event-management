import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteAccountModal from '@/components/shared/DeleteAccountModal';
import * as api from '@/lib/utils/api';

// Mock the API
jest.mock('@/lib/utils/api');

describe('DeleteAccountModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <DeleteAccountModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    render(
      <DeleteAccountModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    expect(screen.getByText('Delete Account Permanently?')).toBeInTheDocument();
  });

  it('should display warning messages', () => {
    render(
      <DeleteAccountModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    expect(screen.getByText(/All your personal data will be permanently removed/)).toBeInTheDocument();
  });

  it('should close modal when cancel button is clicked', () => {
    render(
      <DeleteAccountModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should require password before deletion', () => {
    render(
      <DeleteAccountModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    const deleteButton = screen.getByText('Delete Account');
    expect(deleteButton).toBeDisabled();
  });

  it('should enable delete button when password is entered', async () => {
    const user = userEvent.setup();
    render(
      <DeleteAccountModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'password123');
    
    const deleteButton = screen.getByText('Delete Account');
    expect(deleteButton).not.toBeDisabled();
  });

  it('should show error when password is empty on submit', async () => {
    const user = userEvent.setup();
    render(
      <DeleteAccountModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    
    const deleteButton = screen.getByText('Delete Account');
    await user.click(deleteButton);
    
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('should call API with correct password', async () => {
    const user = userEvent.setup();
    (api.apiDelete as jest.Mock).mockResolvedValue({ message: 'Success' });
    
    render(
      <DeleteAccountModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'password123');
    
    const deleteButton = screen.getByText('Delete Account');
    await user.click(deleteButton);
    
    await waitFor(() => {
      expect(api.apiDelete).toHaveBeenCalledWith('/auth/delete-account', { password: 'password123' });
    });
  });

  it('should handle API errors', async () => {
    const user = userEvent.setup();
    (api.apiDelete as jest.Mock).mockRejectedValue(new Error('Invalid password'));
    
    render(
      <DeleteAccountModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'wrongpassword');
    
    const deleteButton = screen.getByText('Delete Account');
    await user.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid password/)).toBeInTheDocument();
    });
  });

  it('should clear tokens on successful deletion', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');
    
    (api.apiDelete as jest.Mock).mockResolvedValue({ message: 'Success' });
    
    render(
      <DeleteAccountModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'password123');
    
    const deleteButton = screen.getByText('Delete Account');
    await user.click(deleteButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  it('should call onSuccess callback after deletion', async () => {
    const user = userEvent.setup();
    (api.apiDelete as jest.Mock).mockResolvedValue({ message: 'Success' });
    
    render(
      <DeleteAccountModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'password123');
    
    const deleteButton = screen.getByText('Delete Account');
    await user.click(deleteButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(
      <DeleteAccountModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    
    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
    
    const toggleButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('👁'));
    if (toggleButton) {
      await user.click(toggleButton);
      expect(passwordInput.type).toBe('text');
    }
  });

  it('should show loading state during deletion', async () => {
    const user = userEvent.setup();
    (api.apiDelete as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ message: 'Success' }), 100))
    );
    
    render(
      <DeleteAccountModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'password123');
    
    const deleteButton = screen.getByText('Delete Account');
    await user.click(deleteButton);
    
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });
});
