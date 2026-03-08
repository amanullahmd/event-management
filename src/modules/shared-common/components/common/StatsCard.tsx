'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/modules/shared-common/components/ui/card';
import { cn } from '@/modules/shared-common/utils/cn';

export interface StatsCardProps {
  /** Card icon */
  icon?: React.ReactNode;
  /** Card label */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Trend indicator (positive or negative) */
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
    label?: string;
  };
  /** Optional sparkline data */
  sparklineData?: number[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * StatsCard component
 * Displays a metric with optional trend indicator and sparkline
 */
export function StatsCard({
  icon,
  label,
  value,
  trend,
  sparklineData,
  className,
}: StatsCardProps) {
  const isTrendingUp = trend?.direction === 'up';
  const trendColor = isTrendingUp
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';
  const trendBgColor = isTrendingUp
    ? 'bg-green-50 dark:bg-green-900/20'
    : 'bg-red-50 dark:bg-red-900/20';

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Icon and label */}
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                {icon}
              </div>
            )}
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {label}
            </p>
          </div>

          {/* Value */}
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {value}
          </p>

          {/* Trend indicator */}
          {trend && (
            <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium', trendBgColor, trendColor)}>
              {isTrendingUp ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{trend.percentage}%</span>
              {trend.label && <span className="text-xs ml-1">{trend.label}</span>}
            </div>
          )}
        </div>

        {/* Sparkline placeholder */}
        {sparklineData && (
          <div className="w-16 h-12 flex items-end gap-1">
            {sparklineData.map((value, index) => {
              const maxValue = Math.max(...sparklineData);
              const height = (value / maxValue) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 bg-violet-200 dark:bg-violet-800 rounded-sm"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

export default StatsCard;
