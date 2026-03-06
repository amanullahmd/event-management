'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/modules/shared-common/utils/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      setMessage('Please enter a 6-digit code');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await apiPost('/auth/verify-email', { 
        email, 
        code 
      });
      
      setStatus('success');
      setMessage('Email verified successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setMessage(errorMessage);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setResendMessage('Email address is missing');
      return;
    }

    setResendLoading(true);
    setResendMessage('');

    try {
      await apiPost('/auth/resend-verification-code', { email });
      setResendMessage('Verification code sent! Check your email.');
      setCode('');
      setStatus('idle');
      
      // Start cooldown timer
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend code';
      setResendMessage(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
            <p className="text-gray-600">Enter the 6-digit code sent to</p>
            <p className="text-gray-900 font-semibold">{email}</p>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="text-center mb-6">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-green-600 font-semibold">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{message}</p>
            </div>
          )}

          {/* Verification Form */}
          {status !== 'success' && (
            <form onSubmit={handleVerify} className="space-y-6">
              {/* Code Input */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  disabled={resendLoading}
                  aria-label="Verification code"
                />
                <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code from your email</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={code.length !== 6 || resendLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Verify Email
              </button>
            </form>
          )}

          {/* Resend Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm mb-4">Didn't receive the code?</p>
            <button
              onClick={handleResendCode}
              disabled={resendLoading || resendCooldown > 0}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              {resendCooldown > 0 
                ? `Resend in ${resendCooldown}s` 
                : resendLoading 
                ? 'Sending...' 
                : 'Resend Code'}
            </button>
            
            {resendMessage && (
              <p className={`text-sm mt-3 text-center ${
                resendMessage.includes('sent') ? 'text-green-600' : 'text-red-600'
              }`}>
                {resendMessage}
              </p>
            )}
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

