// 터치 스와이프 — 좌우로 이전·다음 달(또는 기간) 이동
import { useRef } from 'react';

const SWIPE_THRESHOLD_PX = 50;

interface TouchPoint {
  x: number;
  y: number;
}

interface SwipeHandlers {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
}

/** enabled=false면 핸들러 no-op (모달 열림 등) */
export function useSwipeMonth(
  onPrev: () => void,
  onNext: () => void,
  enabled = true,
): SwipeHandlers {
  const startRef = useRef<TouchPoint | null>(null);

  function onTouchStart(event: React.TouchEvent) {
    if (!enabled) return;

    const touch = event.changedTouches[0] ?? event.touches[0];
    if (!touch) return;

    startRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event: React.TouchEvent) {
    if (!enabled || !startRef.current) return;

    const touch = event.changedTouches[0];
    if (!touch) {
      startRef.current = null;
      return;
    }

    const dx = touch.clientX - startRef.current.x;
    const dy = touch.clientY - startRef.current.y;
    startRef.current = null;

    // 세로 스크롤 의도면 무시
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) {
      return;
    }

    // 왼쪽 스와이프 → 다음 달, 오른쪽 → 이전 달
    if (dx < 0) {
      onNext();
    } else {
      onPrev();
    }
  }

  return { onTouchStart, onTouchEnd };
}
