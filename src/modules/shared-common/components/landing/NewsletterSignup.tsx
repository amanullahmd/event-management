'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/modules/shared-common/utils/cn';

export interface NewsletterSignupProps {
  className?: string;
}

/**
 * Email newsletter signup section with gradient background.
 * Captures visitor emails for event updates and promotions.
 */
export function NewsletterSignup({ className }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');

    // Simulate signup — in production wire to a real endpoint
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1200);
  };

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        'bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900',
        className
      )}
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
          <Mail className="w-4 h-4" />
          Stay in the loop
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Never miss an event
        </h2>

        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
          Get weekly curated event picks, early access to trending experiences, and exclusive organizer tips delivered to your inbox.
        </p>

        {status === 'success' ? (
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-medium">
              You&apos;re subscribed! Check your inbox for a welcome email.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    'w-full pl-12 pr-4 py-3.5 rounded-xl',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-slate-500',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50',
                    'transition-all duration-200'
                  )}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className={cn(
                  'px-6 py-3.5 rounded-xl',
                  'bg-gradient-to-r from-violet-600 to-purple-600',
                  'hover:from-violet-500 hover:to-purple-500',
                  'text-white font-semibold',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center gap-2 flex-shrink-0'
                )}
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

export default NewsletterSignup;
