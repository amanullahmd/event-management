'use client';

import { useEffect, useState } from 'react';

interface UseCountUpOptions {
  duration?: number;
  startWhen?: boolean;
}

/**
 * Animates a number from 0 to a target value.
 * Uses easeOutExpo for a satisfying deceleration effect.
 */
export function useCountUp(target: number, options: UseCountUpOptions = {}) {
  const { duration = 2000, startWhen = true } = options;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startWhen || target === 0) {
      if (startWhen) setCount(target);
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setCount(target);
      return;
    }

    let start: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, startWhen]);

  return count;
}
