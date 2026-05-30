'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface PullToRefreshOptions {
  /** Distance in pixels to trigger refresh */
  threshold?: number;
  /** Maximum pull distance in pixels */
  maxPullDistance?: number;
  /** Called during pull (progress 0–1) */
  onPullProgress?: (progress: number) => void;
  /** Called when pull exceeds threshold and finger is released */
  onRelease?: () => void;
  /** Whether the gesture is enabled */
  enabled?: boolean;
}

const DEFAULT_THRESHOLD = 64;
const DEFAULT_MAX_PULL_DISTANCE = 80;

export function usePullToRefresh({
  threshold = DEFAULT_THRESHOLD,
  maxPullDistance = DEFAULT_MAX_PULL_DISTANCE,
  onPullProgress,
  onRelease,
  enabled = true,
}: PullToRefreshOptions = {}) {
  const scrollElementRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<{ y: number; time: number } | null>(null);
  const isPullingRef = useRef(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const reset = useCallback(() => {
    touchStartRef.current = null;
    isPullingRef.current = false;
    setIsPulling(false);
    setPullProgress(0);
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!enabled) return;
      const touch = event.touches[0];
      touchStartRef.current = { y: touch.clientY, time: Date.now() };
      isPullingRef.current = false;
    },
    [enabled],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!enabled || !touchStartRef.current) return;
      if (isRefreshing) return;

      const touch = event.touches[0];
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Only track downward pulls
      if (deltaY <= 0) return;

      // Only start if at the top of the scroll container
      const scrollEl = scrollElementRef.current;
      if (scrollEl && scrollEl.scrollTop > 0) return;

      // Only start if we haven't already started pulling
      if (!isPullingRef.current && deltaY < 5) return;

      isPullingRef.current = true;
      setIsPulling(true);

      // Compute progress (0–1) based on maxPullDistance
      const rawProgress = Math.min(deltaY / maxPullDistance, 1);
      // Apply smoothstep easing
      const easedProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);

      setPullProgress(easedProgress);

      if (onPullProgress) {
        onPullProgress(easedProgress);
      }
    },
    [enabled, maxPullDistance, onPullProgress, isRefreshing],
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!touchStartRef.current || !isPullingRef.current) {
        // If we're already refreshing, just reset on any touch end
        if (isRefreshing) return;
        return;
      }

      const touch = event.changedTouches[0];
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (deltaY >= threshold && onRelease) {
        onRelease();
      }

      reset();
    },
    [threshold, onRelease, reset, isRefreshing],
  );

  const triggerRefresh = useCallback(() => {
    if (onRelease) {
      setIsRefreshing(true);
      onRelease();
    }
  }, [onRelease]);

  const setRefreshing = useCallback((refreshing: boolean) => {
    setIsRefreshing(refreshing);
    if (!refreshing) {
      reset();
    }
  }, [reset]);

  useEffect(() => {
    if (!enabled) return;

    const el = scrollElementRef.current || document.documentElement;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);

  return {
    isPulling,
    pullProgress,
    isRefreshing,
    triggerRefresh,
    setRefreshing,
    setScrollElementRef: (el: HTMLElement | null) => {
      scrollElementRef.current = el;
    },
  };
}
