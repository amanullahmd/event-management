/**
 * HeroSection Component
 * 
 * The main hero section of the landing page featuring:
 * - Animated gradient background
 * - Compelling tagline with animations
 * - Glass-morphism search bar
 * - Category bar with horizontally scrollable icons
 * - Responsive design with mobile optimization
 * 
 * @example
 * ```tsx
 * <HeroSection onSearch={handleSearch} />
 * ```
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.7
 */
'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import CategoryBar from './CategoryBar';

export interface HeroSectionProps {
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * HeroSection component for the landing page
 * 
 * @param props - HeroSection configuration props
 * @returns JSX element containing the hero section
 * 
 * Validates: Requirements 1.1 (Display animated gradient background)
 * Validates: Requirements 1.2 (Display animated tagline)
 * Validates: Requirements 1.3 (Contain prominent search bar with glass-morphism styling)
 * Validates: Requirements 1.7 (Include subtle micro-animations)
 */
export function HeroSection({ onSearch, className }: HeroSectionProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Handle search form submission
   * Validates: Requirements 1.4 (Navigate to events page with search query applied)
   */
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!searchQuery.trim()) {
        return;
      }

      setIsSearching(true);

      // Call optional callback
      onSearch?.(searchQuery);

      // Navigate to events page with search query
      const encodedQuery = encodeURIComponent(searchQuery);
      router.push(`/events?search=${encodedQuery}`);

      setIsSearching(false);
    },
    [searchQuery, onSearch, router]
  );

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden',
        'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700',
        'dark:from-violet-900 dark:via-purple-900 dark:to-indigo-950',
        className
      )}
    >
      {/* Animated gradient background - Validates: Requirements 1.1 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
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
        <div
          className={cn(
            'absolute top-1/2 left-1/2 w-80 h-80',
            'bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20',
            'animate-blob animation-delay-4000'
          )}
        />
      </div>

      {/* Content container */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Tagline with animation - Validates: Requirements 1.2 */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h1
              className={cn(
                'text-4xl sm:text-5xl lg:text-6xl font-bold',
                'text-white dark:text-slate-50',
                'mb-4 leading-tight',
                'animate-slide-up'
              )}
            >
              Delightful Events
              <br />
              <span className="bg-gradient-to-r from-pink-200 to-blue-200 bg-clip-text text-transparent">
                Start Here
              </span>
            </h1>

            <p
              className={cn(
                'text-lg sm:text-xl text-white/80 dark:text-slate-200',
                'max-w-2xl mx-auto',
                'animate-slide-up animation-delay-200'
              )}
            >
              Discover amazing events happening near you. From concerts to conferences,
              find your next unforgettable experience.
            </p>
          </div>

          {/* Search bar with glass-morphism - Validates: Requirements 1.3 */}
          <form
            onSubmit={handleSearchSubmit}
            className={cn(
              'mb-8 sm:mb-12',
              'animate-slide-up animation-delay-400'
            )}
          >
            <div
              className={cn(
                'relative max-w-2xl mx-auto',
                'glass-morphism',
                'rounded-full',
                'p-1.5 sm:p-2',
                'shadow-2xl',
                'hover:shadow-3xl transition-shadow duration-300'
              )}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 ml-4 flex-shrink-0" />

                <input
                  type="text"
                  placeholder="Search events, categories, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'flex-1 bg-transparent',
                    'text-slate-900 dark:text-slate-50',
                    'placeholder-slate-500 dark:placeholder-slate-400',
                    'focus:outline-none',
                    'text-base sm:text-lg',
                    'py-2 sm:py-3'
                  )}
                  aria-label="Search events"
                />

                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className={cn(
                    'px-6 sm:px-8 py-2 sm:py-3',
                    'bg-gradient-to-r from-violet-600 to-purple-600',
                    'hover:from-violet-700 hover:to-purple-700',
                    'text-white font-semibold',
                    'rounded-full',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'flex-shrink-0',
                    'mr-1'
                  )}
                  aria-label="Search"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>

          {/* Category bar - Validates: Requirements 1.5 */}
          <div className="animate-slide-up animation-delay-600">
            <CategoryBar />
          </div>
        </div>
      </div>

      {/* Gradient overlay at bottom for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />

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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .dark .glass-morphism {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </section>
  );
}

export default HeroSection;

