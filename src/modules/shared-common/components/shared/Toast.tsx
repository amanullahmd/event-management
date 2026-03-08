'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-400';
      case 'error':
        return 'text-red-800 dark:text-red-400';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-400';
      case 'info':
        return 'text-blue-800 dark:text-blue-400';
      default:
        return 'text-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${getBackgroundColor()} ${getTextColor()} px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3`}
      >
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          className="text-current hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

