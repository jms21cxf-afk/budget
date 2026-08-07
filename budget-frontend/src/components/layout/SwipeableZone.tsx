// 스와이프 영역 — 터치·마우스 드래그로 onPrev/onNext 호출
import { useEffect, useRef, type ReactNode } from 'react';
import './SwipeableZone.css';

const SWIPE_THRESHOLD_PX = 36;
const LOCK_THRESHOLD_PX = 8;

interface TouchPoint {
  x: number;
  y: number;
}

interface GestureState {
  start: TouchPoint | null;
  axis: 'horizontal' | 'vertical' | null;
  active: boolean;
}

interface SwipeableZoneProps {
  children: ReactNode;
  className?: string;
  enabled?: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function emptyGesture(): GestureState {
  return { start: null, axis: null, active: false };
}

export function SwipeableZone({
  children,
  className,
  enabled = true,
  onPrev,
  onNext,
}: SwipeableZoneProps) {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const gestureRef = useRef<GestureState>(emptyGesture());
  const suppressClickRef = useRef(false);
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);

  onPrevRef.current = onPrev;
  onNextRef.current = onNext;

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone || !enabled) return;

    function resetGesture() {
      gestureRef.current = emptyGesture();
    }

    function beginGesture(x: number, y: number) {
      gestureRef.current = {
        start: { x, y },
        axis: null,
        active: true,
      };
    }

    function moveGesture(x: number, y: number, preventDefault?: () => void) {
      const gesture = gestureRef.current;
      if (!gesture.active || !gesture.start) return;

      const dx = x - gesture.start.x;
      const dy = y - gesture.start.y;

      if (gesture.axis === null) {
        if (
          Math.abs(dx) < LOCK_THRESHOLD_PX &&
          Math.abs(dy) < LOCK_THRESHOLD_PX
        ) {
          return;
        }

        gesture.axis =
          Math.abs(dx) >= Math.abs(dy) * 0.6 ? 'horizontal' : 'vertical';
      }

      if (gesture.axis === 'horizontal') {
        preventDefault?.();
      }
    }

    function finishGesture(x: number) {
      const gesture = gestureRef.current;
      if (!gesture.active || !gesture.start) {
        resetGesture();
        return;
      }

      const dx = x - gesture.start.x;
      const wasHorizontal = gesture.axis === 'horizontal';
      resetGesture();

      if (!wasHorizontal || Math.abs(dx) < SWIPE_THRESHOLD_PX) return;

      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 400);

      if (dx < 0) {
        onNextRef.current();
      } else {
        onPrevRef.current();
      }
    }

    // 터치 — 모바일
    function onTouchStart(event: TouchEvent) {
      if (event.touches.length !== 1) return;
      beginGesture(event.touches[0].clientX, event.touches[0].clientY);
    }

    function onTouchMove(event: TouchEvent) {
      if (!gestureRef.current.active || event.touches.length !== 1) return;
      moveGesture(event.touches[0].clientX, event.touches[0].clientY, () =>
        event.preventDefault(),
      );
    }

    function onTouchEnd(event: TouchEvent) {
      if (!gestureRef.current.active) return;
      const touch = event.changedTouches[0];
      if (!touch) {
        resetGesture();
        return;
      }
      finishGesture(touch.clientX);
    }

    // 마우스 — PC 크롬 테스트용
    function onMouseDown(event: MouseEvent) {
      if (event.button !== 0) return;
      beginGesture(event.clientX, event.clientY);
    }

    function onMouseMove(event: MouseEvent) {
      if (!gestureRef.current.active) return;
      moveGesture(event.clientX, event.clientY);
    }

    function onMouseUp(event: MouseEvent) {
      if (!gestureRef.current.active) return;
      finishGesture(event.clientX);
    }

    function onClickCapture(event: MouseEvent) {
      if (!suppressClickRef.current) return;
      event.preventDefault();
      event.stopPropagation();
    }

    zone.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    zone.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    zone.addEventListener('touchend', onTouchEnd, { passive: true, capture: true });
    zone.addEventListener('touchcancel', resetGesture, { passive: true, capture: true });

    zone.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    zone.addEventListener('click', onClickCapture, true);

    return () => {
      zone.removeEventListener('touchstart', onTouchStart, { capture: true });
      zone.removeEventListener('touchmove', onTouchMove, { capture: true });
      zone.removeEventListener('touchcancel', resetGesture, { capture: true });
      zone.removeEventListener('touchend', onTouchEnd, { capture: true });
      zone.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      zone.removeEventListener('click', onClickCapture, true);
      resetGesture();
    };
  }, [enabled]);

  return (
    <div ref={zoneRef} className={className}>
      {children}
    </div>
  );
}
