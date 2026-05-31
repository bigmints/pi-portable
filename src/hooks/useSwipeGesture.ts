'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface SwipeGestureOptions {
  /** Minimum horizontal distance in pixels to register a swipe */
  minSwipeDistance?: number;
  /** Minimum velocity in px/ms to register a swipe */
  minVelocity?: number;
  /** Maximum angle from horizontal (degrees) — prevents scroll-vs-swipe confusion */
  maxAngle?: number;
  /** How far from the left edge (px) to enable right-swipe detection */
  edgeThreshold?: number;
  /** Called during right swipe drag (progress 0–1) */
  onSwipeRight?: (progress: number) => void;
  /** Called when a right swipe completes past the threshold */
  onSwipeRightComplete?: () => void;
  /** Called during left swipe drag (progress 0–1) */
  onSwipeLeft?: (progress: number) => void;
  /** Called when a left swipe completes past the threshold */
  onSwipeLeftComplete?: () => void;
  /** Called when the gesture ends without completing a swipe */
  onGestureEnd?: () => void;
  /** Whether the gesture is enabled */
  enabled?: boolean;
}

const DEFAULT_MIN_SWIPE_DISTANCE = 60;
const DEFAULT_MIN_VELOCITY = 0.4;
const DEFAULT_MAX_ANGLE = 30;
const DEFAULT_EDGE_THRESHOLD = 20;

export function useSwipeGesture({
  minSwipeDistance = DEFAULT_MIN_SWIPE_DISTANCE,
  minVelocity = DEFAULT_MIN_VELOCITY,
  maxAngle = DEFAULT_MAX_ANGLE,
  edgeThreshold = DEFAULT_EDGE_THRESHOLD,
  onSwipeRight,
  onSwipeRightComplete,
  onSwipeLeft,
  onSwipeLeftComplete,
  onGestureEnd,
  enabled = true,
}: SwipeGestureOptions = {}) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const reset = useCallback(() => {
    touchStartRef.current = null;
    setIsDragging(false);
    setProgress(0);
    setDirection(null);
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!enabled) return;
      const touch = event.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      setIsDragging(false);
    },
    [enabled],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!enabled || !touchStartRef.current) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Check angle — only track if mostly horizontal
      const angle = Math.abs(Math.atan2(deltaY, deltaX) * (180 / Math.PI));
      if (angle > maxAngle) return;

      // Determine direction
      if (deltaX > 0) {
        // Right swipe — only from left edge
        if (touchStartRef.current!.x > edgeThreshold) return;

        if (!isDragging) {
          setIsDragging(true);
          setDirection('right');
        }

        const rawProgress = Math.min(deltaX / minSwipeDistance, 1);
        const easedProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
        setProgress(easedProgress);

        if (onSwipeRight) {
          onSwipeRight(easedProgress);
        }
      } else if (deltaX < 0) {
        // Left swipe
        if (!isDragging) {
          setIsDragging(true);
          setDirection('left');
        }

        const rawProgress = Math.min(Math.abs(deltaX) / minSwipeDistance, 1);
        const easedProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
        setProgress(easedProgress);

        if (onSwipeLeft) {
          onSwipeLeft(easedProgress);
        }
      }
    },
    [enabled, maxAngle, edgeThreshold, minSwipeDistance, onSwipeRight, onSwipeLeft, isDragging],
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!touchStartRef.current || !isDragging) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const elapsed = Math.max(Date.now() - touchStartRef.current.time, 1);
      const velocity = Math.abs(deltaX) / elapsed;

      const angle = Math.abs(Math.atan2(deltaY, deltaX) * (180 / Math.PI));

      // Check if swipe meets criteria
      const meetsDistance = Math.abs(deltaX) >= minSwipeDistance;
      const meetsVelocity = velocity >= minVelocity;
      const meetsAngle = angle <= maxAngle;

      if (meetsDistance && meetsVelocity && meetsAngle) {
        if (deltaX > 0 && onSwipeRightComplete) {
          onSwipeRightComplete();
        } else if (deltaX < 0 && onSwipeLeftComplete) {
          onSwipeLeftComplete();
        }
      } else if (onGestureEnd) {
        onGestureEnd();
      }

      reset();
    },
    [minSwipeDistance, minVelocity, maxAngle, onSwipeRightComplete, onSwipeLeftComplete, onGestureEnd, reset, isDragging],
  );

  useEffect(() => {
    if (!enabled) return;

    const el = elementRef.current || document.documentElement;
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
    progress,
    direction,
    isDragging,
    setElementRef: (el: HTMLElement | null) => {
      elementRef.current = el;
    },
  };
}
