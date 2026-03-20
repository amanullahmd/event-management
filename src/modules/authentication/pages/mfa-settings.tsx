'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getMfaStatus, disableMfa, MfaStatusResponse } from '../services/mfaService';

/**
 * MFA security settings hub.
 * Shows status of each MFA method and links to setup wizards.
 */
export default function MfaSettingsPage() {
  const [status, setStatus] = useState<MfaStatusResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [disableModal, setDisableModal] = useState<{ method: string } | null>(null);
  const [disablePassword, setDisablePassword] = useState('');
  const [disabling, setDisabling] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const s = await getMfaStatus();
      setStatus(s);
    } catch {
      setError('Failed to load MFA settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleDisable = async () => {
    if (!disableModal) return;
    setDisabling(true);
    try {
      await disableMfa(disableModal.method, disablePassword);
      setDisableModal(null);
      setDisablePassword('');
      await loadStatus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to disable MFA.');
    } finally {
      setDisabling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Two-Factor Authentication</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
        Add an extra layer of security to your account. Once enabled, you will be asked for a
        verification code each time you sign in.
      </p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Authenticator App (TOTP) */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Authenticator App</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Use Google Authenticator, Authy, or any TOTP app.
              </p>
              {status?.totpConfigured && (
                <span className="inline-block mt-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full px-2.5 py-0.5">
                  Active
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {status?.totpConfigured ? (
              <button
                onClick={() => setDisableModal({ method: 'TOTP' })}
                className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Disable
              </button>
            ) : (
              <Link
                href="/dashboard/security/mfa/totp-setup"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Set up
              </Link>
            )}
          </div>
        </div>

        {/* SMS */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">SMS Text Message</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {status?.smsConfigured
                  ? `Registered: ${status.maskedPhone}`
                  : 'Receive a code via SMS to your phone.'}
              </p>
              {status?.smsConfigured && (
                <span className="inline-block mt-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full px-2.5 py-0.5">
                  Active
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {status?.smsConfigured ? (
              <button
                onClick={() => setDisableModal({ method: 'SMS' })}
                className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Disable
              </button>
            ) : (
              <Link
                href="/dashboard/security/mfa/sms-setup"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Set up
              </Link>
            )}
          </div>
        </div>

        {/* Disable all */}
        {status?.mfaEnabled && (
          <div className="mt-2 text-right">
            <button
              onClick={() => setDisableModal({ method: 'ALL' })}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              Disable all 2FA methods
            </button>
          </div>
        )}
      </div>

      {/* Disable confirmation modal */}
      {disableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm disable</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enter your password to disable{' '}
              <span className="font-medium">
                {disableModal.method === 'ALL' ? 'all MFA methods' : disableModal.method}
              </span>
              .
            </p>
            <input
              type="password"
              placeholder="Your password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setDisableModal(null); setDisablePassword(''); }}
                className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDisable}
                disabled={disabling || !disablePassword}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {disabling ? 'Disabling…' : 'Disable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
