'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Card } from '@/modules/shared-common/components/ui/card';
import { cn } from '@/modules/shared-common/utils/cn';

export interface WelcomeBannerProps {
  /** User's first name */
  userName: string;
  /** Summary stats to display */
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get time-of-day greeting
 */
function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * WelcomeBanner component
 * Displays personalized greeting with quick summary stats
 */
export function WelcomeBanner({
  userName,
  stats,
  className,
}: WelcomeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const greeting = getTimeOfDayGreeting();

  return (
    <Card
      className={cn(
        'bg-gradient-to-r from-violet-500 to-purple-600 dark:from-violet-900 dark:to-purple-900',
        'text-white p-6 relative overflow-hidden',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              {greeting}, {userName}! 👋
            </h2>
            <p className="text-white/80 text-sm mt-1">
              Welcome back to your dashboard
            </p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-white/70 text-xs font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default WelcomeBanner;
