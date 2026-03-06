'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatErrorMessage } from '@/modules/shared-common/utils/error-formatter';
import { useToast } from '@/components/shared/ToastContainer';
import type { Event } from '@/lib/types';

interface PublishUnpublishButtonProps {
  eventId: string;
  status: 'draft' | 'published' | 'unpublished';
  onSuccess: (updatedEvent: Event) => void;
  onError: (error: string) => void;
}

interface ConfirmationDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 max-w-sm mx-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PublishUnpublishButton: React.FC<PublishUnpublishButtonProps> = ({
  eventId,
  status,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { addToast } = useToast();

  const getAuthToken = (): string => {
    return localStorage.getItem('auth_token') || '';
  };

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/events/${eventId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to publish event' }));
        throw error;
      }

      const updatedEvent = await response.json();
      onSuccess(updatedEvent);
      addToast('Event published successfully!', 'success', 3000);
      setShowConfirmation(false);
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/events/${eventId}/unpublish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to unpublish event' }));
        throw error;
      }

      const updatedEvent = await response.json();
      onSuccess(updatedEvent);
      addToast('Event unpublished successfully!', 'success', 3000);
      setShowConfirmation(false);
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'published') {
    return (
      <>
        <Button
          onClick={() => setShowConfirmation(true)}
          disabled={isLoading}
          className="bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Unpublishing...' : 'Unpublish'}
        </Button>
        {showConfirmation && (
          <ConfirmationDialog
            title="Unpublish Event"
            message="Are you sure you want to unpublish this event? It will be hidden from public listings."
            onConfirm={handleUnpublish}
            onCancel={() => setShowConfirmation(false)}
            isLoading={isLoading}
            confirmText="Unpublish"
          />
        )}
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowConfirmation(true)}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Publishing...' : 'Publish'}
      </Button>
      {showConfirmation && (
        <ConfirmationDialog
          title="Publish Event"
          message="Are you sure you want to publish this event? It will be visible to the public."
          onConfirm={handlePublish}
          onCancel={() => setShowConfirmation(false)}
          isLoading={isLoading}
          confirmText="Publish"
        />
      )}
    </>
  );
};

export default PublishUnpublishButton;

