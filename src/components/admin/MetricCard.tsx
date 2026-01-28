'use client';

import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * Metric card component for displaying key dashboard metrics
 */
export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
}: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {value}
          </p>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
          {trend && (
            <div className={`text-sm font-medium mt-2 ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
