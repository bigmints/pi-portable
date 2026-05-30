'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePwaStore } from '@/store/pwa';

interface GestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPullDown?: () => void;
  onPullUp?: () => void;
  onDoubleTap?: () => void;
  threshold?: number;
  pullThreshold?: number;
  enabled?: boolean;
}

const DEFAULT_THRESHOLD = 80;
const DEFAULT_PULL_THRESHOLD = 60;
const DOUBLE_TAP_DELAY = 300;

export function useMobileGestures({
  onSwipeLeft,
  onSwipeRight,
  onPullDown,
  onPullUp,
  onDoubleTap,
  threshold = DEFAULT_THRESHOLD,
  pullThreshold = DEFAULT_PULL_THRESHOLD,
  enabled = true,
}: GestureOptions = {}) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isScrollingRef = useRef(false);
  const lastTapRef = useRef(0);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled) return;
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    isScrollingRef.current = false;
  }, [enabled]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Detect if user is scrolling
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      isScrollingRef.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      const start = touchStartRef.current;
      if (!start) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;

      // Double tap detection
      if (onDoubleTap && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        const now = Date.now();
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
          onDoubleTap();
          lastTapRef.current = 0;
        } else {
          lastTapRef.current = now;
        }
      }

      touchStartRef.current = null;

      // If scrolling, don't trigger gestures
      if (isScrollingRef.current) {
        isScrollingRef.current = false;
        return;
      }

      // Horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
        return;
      }

      // Pull down (only from top of screen)
      if (
        deltaY > pullThreshold &&
        start.y < 30 &&
        Math.abs(deltaY) > Math.abs(deltaX) &&
        onPullDown
      ) {
        onPullDown();
        return;
      }

      // Pull up (only from bottom of screen)
      if (
        deltaY < -pullThreshold &&
        start.y > window.innerHeight - 30 &&
        Math.abs(deltaY) > Math.abs(deltaX) &&
        onPullUp
      ) {
        onPullUp();
      }
    },
    [onSwipeLeft, onSwipeRight, onPullDown, onPullUp, onDoubleTap, threshold, pullThreshold]
  );

  useEffect(() => {
    if (!enabled) return;

    const el = document.documentElement;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);

  // Update isMobile on resize
  useEffect(() => {
    const handleResize = () => {
      usePwaStore.getState().setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);
}
