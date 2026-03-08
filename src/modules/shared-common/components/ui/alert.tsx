import React from 'react';
import { cn } from '@/modules/shared-common/utils/cn';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'error' | 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, message, children, ...props }, ref) => {
    const variantClasses = {
      default: 'border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
      destructive: 'border-red-200 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950 dark:text-red-50',
      success: 'border-green-200 bg-green-50 text-green-950 dark:border-green-800 dark:bg-green-950 dark:text-green-50',
      error: 'border-red-200 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950 dark:text-red-50',
      warning: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-50',
      info: 'border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-50',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-lg border p-4',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {title && <div className="font-semibold mb-1">{title}</div>}
        {message && <div className="text-sm">{message}</div>}
        {children}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export type AlertDescriptionProps = React.HTMLAttributes<HTMLDivElement>;

const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };

