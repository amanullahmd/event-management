'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { initiateSmsSetup, confirmSmsSetup } from '@/modules/authentication/services/mfaService';
import { PhoneInput } from '@/modules/shared-common/components/ui/phone-input';

type Step = 1 | 2 | 3;

/**
 * SMS OTP setup wizard (2 steps + success):
 * 1. Enter phone number
 * 2. Enter OTP received via SMS
 * 3. Success
 */
export default function SmsSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    setLoading(true);
    try {
      const id = await initiateSmsSetup(phone.trim());
      setChallengeId(id);
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code.length !== 6) { setError('Enter a 6-digit code.'); return; }
    setLoading(true);
    try {
      await confirmSmsSetup(challengeId, code);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => router.push('/dashboard/security')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Set up SMS Authentication</h1>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Enter your phone number</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              We will send a one-time verification code to this number each time you sign in.
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone number</label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send Code'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleConfirm} className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Enter the code</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              A 6-digit code was sent to <span className="font-medium text-gray-900 dark:text-white">{phone}</span>.
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              autoComplete="one-time-code"
              className="w-full text-center text-2xl font-mono tracking-[0.5em] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Verify & Activate'}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Change phone number
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SMS Authentication Enabled</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your phone <span className="font-medium text-gray-900 dark:text-white">{phone}</span> is now linked for MFA.
          </p>
          <button
            onClick={() => router.push('/dashboard/security')}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
