import React from 'react';
import { cn } from '@/modules/shared-common/utils/cn';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const colorVariants = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-500',
    light: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-500',
    light: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400'
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-500',
    light: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400'
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-500',
    light: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400'
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-500',
    light: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400'
  },
  yellow: {
    gradient: 'from-yellow-500 to-yellow-600',
    bg: 'bg-yellow-500',
    light: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-600 dark:text-yellow-400'
  }
};

const sizeVariants = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

/**
 * Modern Metric Card Component
 * Professional metric display with trend indicators and beautiful gradients
 */
export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
  size = 'md',
  className,
  children
}: MetricCardProps) {
  const colorVariant = colorVariants[color];
  const sizeVariant = sizeVariants[size];

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-green-600 dark:text-green-400';
    if (trend.value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const TrendIcon = getTrendIcon();

  return (
    <div className={cn(
      `bg-gradient-to-br ${colorVariant.gradient} rounded-2xl shadow-xl text-white relative overflow-hidden`,
      sizeVariant,
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full backdrop-blur-sm"></div>
      <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-16 h-16 bg-white/5 rounded-full backdrop-blur-sm"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {Icon && (
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Icon className="w-6 h-6" />
            </div>
          )}
          {trend && TrendIcon && (
            <div className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
              <TrendIcon className="w-4 h-4" />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="text-3xl font-bold">
            {value}
          </div>
          <div className={`${colorVariant.gradient.replace('from-', 'text-').replace(' to-', '/100 text-')} opacity-90`}>
            {title}
          </div>
          {description && (
            <div className="text-sm opacity-75">
              {description}
            </div>
          )}
        </div>

        {children && (
          <div className="mt-4 pt-4 border-t border-white/20">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default MetricCard;
