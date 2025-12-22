import { useEffect, useRef, useState } from 'react';

interface GestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  isSwiping: boolean;
}

interface GestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
}

export const useMobileGestures = (callbacks: GestureCallbacks) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    isSwiping: false,
  });

  const longPressTimeout = useRef<NodeJS.Timeout>();
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    const newState = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isSwiping: false,
    };
    setGestureState(newState);

    // Start long press timer
    longPressTimeout.current = setTimeout(() => {
      callbacks.onLongPress?.();
    }, 500);
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - gestureState.startX;
    const deltaY = touch.clientY - gestureState.startY;

    setGestureState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY,
      isSwiping: Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10,
    }));

    // Cancel long press if swiping
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
    }
  };

  const handleTouchEnd = () => {
    const { deltaX, deltaY, isSwiping } = gestureState;
    
    if (isSwiping) {
      const minSwipeDistance = 50;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            callbacks.onSwipeRight?.();
          } else {
            callbacks.onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            callbacks.onSwipeDown?.();
          } else {
            callbacks.onSwipeUp?.();
          }
        }
      }
    } else {
      // Tap gesture
      callbacks.onTap?.();
    }

    // Clear long press timer
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }

    // Reset gesture state
    setGestureState(prev => ({ ...prev, isSwiping: false }));
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
    };
  }, [gestureState]);

  return elementRef;
};
