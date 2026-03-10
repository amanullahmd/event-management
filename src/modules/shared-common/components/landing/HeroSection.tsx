'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/modules/shared-common/utils/cn';

export interface HeroSectionProps {
  onSearch?: (query: string) => void;
  className?: string;
}

/**
 * Premium hero section with mesh gradient, bold typography,
 * wide search bar, and trust line.
 */
export function HeroSection({ onSearch, className }: HeroSectionProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      setIsSearching(true);
      onSearch?.(searchQuery);
      router.push(`/events?search=${encodeURIComponent(searchQuery)}`);
      setIsSearching(false);
    },
    [searchQuery, onSearch, router]
  );

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden',
        'min-h-[520px] sm:min-h-[560px] lg:min-h-[600px]',
        'flex items-center',
        className
      )}
    >
      {/* Mesh gradient background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-950 dark:via-purple-950 dark:to-indigo-950" />

        {/* Mesh layers */}
        <div className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              radial-gradient(at 20% 80%, rgba(236, 72, 153, 0.3) 0px, transparent 50%),
              radial-gradient(at 80% 20%, rgba(59, 130, 246, 0.3) 0px, transparent 50%),
              radial-gradient(at 50% 50%, rgba(139, 92, 246, 0.2) 0px, transparent 50%),
              radial-gradient(at 0% 0%, rgba(236, 72, 153, 0.15) 0px, transparent 40%),
              radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.2) 0px, transparent 40%)
            `,
          }}
        />

        {/* Animated floating orbs */}
        <div className="hero-orb absolute -top-20 -right-20 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-3xl" />
        <div className="hero-orb-delayed absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-3xl" />
        <div className="hero-orb-slow absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-violet-400/10 rounded-full blur-3xl" />

        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="hero-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white/90 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-amber-300" />
            The modern event platform
          </div>

          {/* Main heading */}
          <h1 className="hero-slide-up text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            Your Next Experience
            <br />
            <span className="bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Starts Here
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-slide-up-delayed text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover concerts, conferences, workshops and more — or create your own event in minutes.
          </p>

          {/* Wide search bar */}
          <form onSubmit={handleSearchSubmit} className="hero-slide-up-delayed-2 mb-6">
            <div className={cn(
              'relative max-w-3xl mx-auto',
              'bg-white/10 backdrop-blur-md',
              'border border-white/20',
              'rounded-2xl',
              'p-2',
              'shadow-2xl shadow-black/10',
              'hover:bg-white/[0.12] hover:border-white/25',
              'transition-all duration-300',
              'group'
            )}>
              <div className="flex items-center gap-2 sm:gap-3">
                <Search className="w-5 h-5 text-white/50 ml-4 flex-shrink-0" />

                <input
                  type="text"
                  placeholder="Search events, categories, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'flex-1 bg-transparent',
                    'text-white placeholder-white/40',
                    'focus:outline-none',
                    'text-base sm:text-lg',
                    'py-2.5 sm:py-3'
                  )}
                  aria-label="Search events"
                />

                <div className="hidden sm:flex items-center gap-1.5 text-white/30 text-sm pr-2 border-r border-white/10 mr-2">
                  <MapPin className="w-4 h-4" />
                  Anywhere
                </div>

                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className={cn(
                    'px-6 sm:px-8 py-2.5 sm:py-3',
                    'bg-white text-violet-700',
                    'hover:bg-slate-50',
                    'font-semibold',
                    'rounded-xl',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-white/50',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    'flex-shrink-0',
                    'shadow-lg shadow-black/5'
                  )}
                  aria-label="Search"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>

          {/* Quick filter links */}
          <div className="hero-slide-up-delayed-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="text-white/40 text-sm">Popular:</span>
            {['Music', 'Tech', 'Food & Drink', 'Networking', 'Free Events'].map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/events?search=${encodeURIComponent(tag)}`)}
                className="px-3 py-1 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent" />

      {/* Animation styles */}
      <style jsx>{`
        @keyframes heroFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes heroSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-orb { animation: heroFloat 8s ease-in-out infinite; }
        .hero-orb-delayed { animation: heroFloat 10s ease-in-out infinite 2s; }
        .hero-orb-slow { animation: heroFloat 12s ease-in-out infinite 4s; }

        .hero-fade-in {
          animation: heroFadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .hero-slide-up {
          animation: heroSlideUp 0.7s ease-out 0.1s forwards;
          opacity: 0;
        }

        .hero-slide-up-delayed {
          animation: heroSlideUp 0.7s ease-out 0.25s forwards;
          opacity: 0;
        }

        .hero-slide-up-delayed-2 {
          animation: heroSlideUp 0.7s ease-out 0.4s forwards;
          opacity: 0;
        }

        .hero-slide-up-delayed-3 {
          animation: heroSlideUp 0.7s ease-out 0.55s forwards;
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-orb,
          .hero-orb-delayed,
          .hero-orb-slow {
            animation: none;
          }
          .hero-fade-in,
          .hero-slide-up,
          .hero-slide-up-delayed,
          .hero-slide-up-delayed-2,
          .hero-slide-up-delayed-3 {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}

export default HeroSection;
