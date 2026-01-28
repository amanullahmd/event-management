'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks';

/**
 * Login page component
 * Displays login form with email and password fields
 * Handles login submission and authentication
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate form
      if (!email) {
        throw new Error('Email is required');
      }
      if (!password) {
        throw new Error('Password is required');
      }

      // Attempt login
      await login(email, password);

      // Redirect based on user role
      if (email.includes('admin')) {
        router.push('/admin');
      } else if (email.includes('organizer')) {
        router.push('/organizer');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">E</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Sign in to your EventHub account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                disabled={isSubmitting || isLoading}
                aria-label="Email address"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                disabled={isSubmitting || isLoading}
                aria-label="Password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 dark:disabled:bg-slate-600 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-violet-500/25"
            >
              {isSubmitting || isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
            <p className="text-sm font-semibold text-violet-900 dark:text-violet-200 mb-3">
              🔐 Demo Credentials
            </p>
            <div className="space-y-3">
              {/* Admin */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-violet-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">Admin Account</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Email:</span> <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-900 dark:text-white text-xs">admin@example.com</code>
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Password:</span> <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-900 dark:text-white text-xs">admin123</code>
                </p>
              </div>
              {/* Organizer */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-fuchsia-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400 mb-1">Organizer Account</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Email:</span> <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-900 dark:text-white text-xs">organizer1@example.com</code>
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Password:</span> <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-900 dark:text-white text-xs">organizer123</code>
                </p>
              </div>
              {/* Customer */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-blue-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Customer Account</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Email:</span> <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-900 dark:text-white text-xs">customer1@example.com</code>
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Password:</span> <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-900 dark:text-white text-xs">customer123</code>
                </p>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
