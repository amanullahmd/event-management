'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/modules/shared-common/components/ui/card';
import { cn } from '@/modules/shared-common/utils/cn';

export interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  color?: 'violet' | 'blue' | 'green' | 'orange' | 'pink';
}

export interface QuickActionsProps {
  /** Array of quick action items */
  actions: QuickAction[];
  /** Additional CSS classes */
  className?: string;
}

const colorClasses = {
  violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
};

/**
 * QuickActions component
 * Displays role-based action cards for quick access to common tasks
 */
export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {actions.map((action) => (
        <Link key={action.id} href={action.href}>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex flex-col items-start gap-3">
              {/* Icon */}
              <div className={cn('p-3 rounded-lg', colorClasses[action.color || 'violet'])}>
                {action.icon}
              </div>

              {/* Label and description */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {action.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default QuickActions;
