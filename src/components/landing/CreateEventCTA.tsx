/**
 * CreateEventCTA Component
 * 
 * A prominent call-to-action section encouraging users to create events.
 * Features gradient background, key benefits, and action buttons.
 * 
 * Features:
 * - Gradient background with modern design
 * - Key benefits of creating events
 * - Primary and secondary action buttons
 * - Responsive design
 * - Visually distinct from other sections
 * 
 * @example
 * ```tsx
 * <CreateEventCTA />
 * ```
 * 
 * Requirements: 15.1, 15.3, 15.4
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Users, BarChart3, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface CreateEventCTAProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Benefit item for the CTA section
 */
interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

/**
 * Key benefits of creating events
 */
const benefits: Benefit[] = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Easy Setup',
    description: 'Create your event in minutes with our intuitive event builder',
  },
  {
    icon: <Ticket className="w-6 h-6" />,
    title: 'Sell Tickets',
    description: 'Flexible ticketing options with secure payment processing',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Reach Audience',
    description: 'Get discovered by thousands of event enthusiasts',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Track Analytics',
    description: 'Monitor ticket sales, attendance, and attendee insights',
  },
];

/**
 * CreateEventCTA component for encouraging event creation
 * 
 * @param props - CreateEventCTA configuration props
 * @returns JSX element containing the CTA section
 * 
 * Validates: Requirements 15.1 (Display prominent CTA section)
 * Validates: Requirements 15.3 (Display key benefits)
 * Validates: Requirements 15.4 (Include primary and secondary action buttons)
 */
export function CreateEventCTA({ className }: CreateEventCTAProps) {
  return (
    <section
      className={cn(
        'relative w-full overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700',
        'dark:from-violet-900 dark:via-purple-900 dark:to-indigo-950',
        'px-4 sm:px-6 lg:px-8',
        'py-16 sm:py-20 lg:py-24',
        className
      )}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            'absolute -top-40 -right-40 w-80 h-80',
            'bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20',
            'animate-blob'
          )}
        />
        <div
          className={cn(
            'absolute -bottom-40 -left-40 w-80 h-80',
            'bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20',
            'animate-blob animation-delay-2000'
          )}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Create Your Event?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Join thousands of organizers who are creating amazing events on our platform.
            Get started free today.
          </p>
        </div>

        {/* Benefits grid - Validates: Requirements 15.3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 sm:mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={cn(
                'p-4 rounded-lg',
                'bg-white/10 backdrop-blur-sm',
                'border border-white/20',
                'hover:bg-white/20 transition-colors duration-200'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-white/80">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-white/70">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons - Validates: Requirements 15.4 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Primary button */}
          <Link
            href="/organizer/events/create"
            className={cn(
              'px-8 py-3.5 rounded-lg',
              'bg-white text-violet-600',
              'font-semibold',
              'hover:bg-slate-50',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-violet-600',
              'inline-flex items-center justify-center'
            )}
          >
            Get Started Free
          </Link>

          {/* Secondary button */}
          <Link
            href="/organizer/learn"
            className={cn(
              'px-8 py-3.5 rounded-lg',
              'bg-white/20 text-white',
              'border border-white/40',
              'font-semibold',
              'hover:bg-white/30 hover:border-white/60',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-violet-600',
              'inline-flex items-center justify-center'
            )}
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}

export default CreateEventCTA;

