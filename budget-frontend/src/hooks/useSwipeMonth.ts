// 터치·마우스 스와이프 — 좌우로 이전·다음 달(또는 기간) 이동
import { useEffect, useRef } from 'react';

const SWIPE_THRESHOLD_PX = 40;
const LOCK_THRESHOLD_PX = 6;

interface TouchPoint {
  x: number;
  y: number;
}

interface GestureState {
  start: TouchPoint | null;
  axis: 'horizontal' | 'vertical' | null;
  pointerId: number | null;
  active: boolean;
}

function emptyGesture(): GestureState {
  return { start: null, axis: null, pointerId: null, active: false };
}

/** enabled=false면 리스너 미등록 (모달 열림 등) */
export function useSwipeMonth(
  onPrev: () => void,
  onNext: () => void,
  enabled = true,
) {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const gestureRef = useRef<GestureState>(emptyGesture());
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);

  onPrevRef.current = onPrev;
  onNextRef.current = onNext;

  useEffect(() => {
    if (!enabled) return;

    function inZone(target: EventTarget | null) {
      const zone = zoneRef.current;
      return Boolean(zone && target instanceof Node && zone.contains(target));
    }

    function resetGesture() {
      gestureRef.current = emptyGesture();
    }

    function beginGesture(x: number, y: number, pointerId: number) {
      gestureRef.current = {
        start: { x, y },
        axis: null,
        pointerId,
        active: true,
      };
    }

    function moveGesture(
      x: number,
      y: number,
      preventDefault: () => void,
    ) {
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

        // 대각선도 가로 스와이프로 관대하게 인식
        gesture.axis =
          Math.abs(dx) >= Math.abs(dy) * 0.65 ? 'horizontal' : 'vertical';
      }

      if (gesture.axis === 'horizontal') {
        preventDefault();
      }
    }

    function endGesture(x: number) {
      const gesture = gestureRef.current;
      if (!gesture.active || !gesture.start || gesture.axis !== 'horizontal') {
        resetGesture();
        return;
      }

      const dx = x - gesture.start.x;
      resetGesture();

      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;

      if (dx < 0) {
        onNextRef.current();
      } else {
        onPrevRef.current();
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (!inZone(event.target)) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      beginGesture(event.clientX, event.clientY, event.pointerId);
    }

    function onPointerMove(event: PointerEvent) {
      const gesture = gestureRef.current;
      if (!gesture.active || event.pointerId !== gesture.pointerId) return;

      moveGesture(event.clientX, event.clientY, () => event.preventDefault());
    }

    function onPointerUp(event: PointerEvent) {
      const gesture = gestureRef.current;
      if (!gesture.active || event.pointerId !== gesture.pointerId) return;

      endGesture(event.clientX);
    }

    const capture = { capture: true };
    const moveOptions = { capture: true, passive: false };

    document.addEventListener('pointerdown', onPointerDown, capture);
    document.addEventListener('pointermove', onPointerMove, moveOptions);
    document.addEventListener('pointerup', onPointerUp, capture);
    document.addEventListener('pointercancel', resetGesture, capture);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, capture);
      document.removeEventListener('pointermove', onPointerMove, moveOptions);
      document.removeEventListener('pointerup', onPointerUp, capture);
      document.removeEventListener('pointercancel', resetGesture, capture);
      resetGesture();
    };
  }, [enabled]);

  return zoneRef;
}
