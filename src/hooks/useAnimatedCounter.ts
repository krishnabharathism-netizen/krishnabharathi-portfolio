// src/hooks/useAnimatedCounter.ts
import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * @param target   - The final number to count up to
 * @param duration - Animation duration in milliseconds (default 1500)
 * @param started  - Set to true to trigger the animation (default true)
 */
export const useAnimatedCounter = (
  target: number,
  duration: number = 1500,
  started: boolean = true
): number => {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    // Don't start until `started` is true
    if (!started) return;

    // Reset to 0 each time target or started changes
    setValue(0);

    const startTime = Date.now();

    const animate = () => {
      const elapsed  = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: starts fast, slows at the end
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount or re-run
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, started]);

  return value;
};