'use client';

import React from 'react';

interface PulsarFlowLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
}

const sizes = {
  sm: { icon: 24, text: 'text-sm' },
  md: { icon: 32, text: 'text-lg' },
  lg: { icon: 40, text: 'text-xl' },
  xl: { icon: 48, text: 'text-2xl' },
};

/**
 * PulsarFlow brand logo with animated pulse ring SVG icon
 */
export function PulsarFlowLogo({ size = 'md', variant = 'full', className = '' }: PulsarFlowLogoProps) {
  const s = sizes[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer glow ring */}
        <circle cx="24" cy="24" r="22" stroke="url(#pf-ring)" strokeWidth="2" opacity="0.3" />
        {/* Main circle */}
        <circle cx="24" cy="24" r="18" fill="url(#pf-bg)" />
        {/* Pulse wave line */}
        <path d="M10 24h5l3-7 3 7 3-14 3 14 3-7h5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="pf-bg" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="pf-ring" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
      {variant === 'full' && (
        <span className={`font-bold ${s.text} bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent`}>
          PulsarFlow
        </span>
      )}
    </span>
  );
}

export default PulsarFlowLogo;
