// 월 이동 — < 2026.8 >
import { formatMonthLabel } from '../../utils/format';
import './MonthNavigator.css';

interface MonthNavigatorProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNavigator({
  year,
  month,
  onPrev,
  onNext,
}: MonthNavigatorProps) {
  return (
    <nav className="month-nav" aria-label="월 선택">
      <button type="button" className="month-nav__btn" onClick={onPrev}>
        &lt;
      </button>
      <span className="month-nav__label">{formatMonthLabel(year, month)}</span>
      <button type="button" className="month-nav__btn" onClick={onNext}>
        &gt;
      </button>
    </nav>
  );
}
