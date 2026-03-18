'use client';

import { useState } from 'react';
import { apiDelete } from '@/modules/shared-common/utils/api';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/modules/shared-common/components/ui/dialog';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Input } from '@/modules/shared-common/components/ui/input';
import { Alert } from '@/modules/shared-common/components/ui/alert';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
}: DeleteAccountModalProps) {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const CONFIRM_PHRASE = 'DELETE MY ACCOUNT';
  const isConfirmed = confirmText === CONFIRM_PHRASE;

  const handleClose = () => {
    setPassword('');
    setConfirmText('');
    setError('');
    setShowPassword(false);
    onClose();
  };

  const handleDeleteAccount = async () => {
    setError('');

    if (!password.trim()) {
      setError('Password is required to confirm account deletion');
      return;
    }

    if (!isConfirmed) {
      setError(`Please type "${CONFIRM_PHRASE}" to confirm`);
      return;
    }

    setIsLoading(true);

    try {
      await apiDelete('/auth/delete-account', { password });
      // Account deleted successfully — log out and redirect
      logout();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account. Please check your password and try again.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 dark:text-red-400">Delete Account</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-4">
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-semibold mb-1">You will permanently lose:</p>
                <ul className="list-disc list-inside space-y-1 text-red-600 dark:text-red-400">
                  <li>Your profile and account data</li>
                  <li>All your tickets and order history</li>
                  <li>Your events (if organizer)</li>
                  <li>Access to the platform</li>
                </ul>
                <p className="mt-2 text-red-600 dark:text-red-400">
                  Your personal data will be anonymized in compliance with GDPR.
                </p>
              </div>
            </div>
          </div>

          {/* Password Confirmation */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Enter your password to confirm
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Type to Confirm */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Type <span className="font-mono font-bold text-red-600 dark:text-red-400">{CONFIRM_PHRASE}</span> to confirm
            </label>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError('');
              }}
              placeholder={CONFIRM_PHRASE}
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="error" title="Error" message={error} />
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            disabled={isLoading || !password.trim() || !isConfirmed}
            variant="default"
            className="bg-red-600 hover:bg-red-700 text-white border-none"
          >
            {isLoading ? 'Deleting...' : 'Permanently Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
