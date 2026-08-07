// 터치 스와이프 — 좌우로 이전·다음 달(또는 기간) 이동
import { useEffect, useRef } from 'react';

const SWIPE_THRESHOLD_PX = 48;
const LOCK_THRESHOLD_PX = 8;

interface TouchPoint {
  x: number;
  y: number;
}

/** enabled=false면 리스너 미등록 (모달 열림 등) */
export function useSwipeMonth(
  onPrev: () => void,
  onNext: () => void,
  enabled = true,
) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<TouchPoint | null>(null);
  const axisRef = useRef<'horizontal' | 'vertical' | null>(null);
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);

  onPrevRef.current = onPrev;
  onNextRef.current = onNext;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    function resetTouch() {
      startRef.current = null;
      axisRef.current = null;
    }

    function handleTouchStart(event: TouchEvent) {
      if (event.touches.length !== 1) return;

      const touch = event.touches[0];
      startRef.current = { x: touch.clientX, y: touch.clientY };
      axisRef.current = null;
    }

    function handleTouchMove(event: TouchEvent) {
      if (!startRef.current || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const dx = touch.clientX - startRef.current.x;
      const dy = touch.clientY - startRef.current.y;

      // 스크롤 vs 스와이프 방향 잠금
      if (axisRef.current === null) {
        if (
          Math.abs(dx) < LOCK_THRESHOLD_PX &&
          Math.abs(dy) < LOCK_THRESHOLD_PX
        ) {
          return;
        }

        axisRef.current =
          Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      }

      // 가로 스와이프 — 브라우저 기본 스크롤 억제
      if (axisRef.current === 'horizontal') {
        event.preventDefault();
      }
    }

    function handleTouchEnd(event: TouchEvent) {
      if (!startRef.current || axisRef.current !== 'horizontal') {
        resetTouch();
        return;
      }

      const touch = event.changedTouches[0];
      if (!touch) {
        resetTouch();
        return;
      }

      const dx = touch.clientX - startRef.current.x;
      resetTouch();

      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;

      if (dx < 0) {
        onNextRef.current();
      } else {
        onPrevRef.current();
      }
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', resetTouch, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', resetTouch);
    };
  }, [enabled]);

  return elementRef;
}
