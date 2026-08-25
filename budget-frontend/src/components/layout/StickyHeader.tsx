// 상단 고정 헤더 — 월·탭·필터·점선 구분
import type { TransactionType } from '../../types/category';
import type { ViewMode } from '../../utils/constants';
import { FilterBar } from './FilterBar';
import { MonthNavigator } from './MonthNavigator';
import { SwipeableZone } from './SwipeableZone';
import { ViewTabs } from './ViewTabs';
import './StickyHeader.css';

interface StickyHeaderProps {
  year: number;
  month: number;
  view: ViewMode;
  type: TransactionType;
  incomeTotal: number;
  expenseTotal: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onViewChange: (view: ViewMode) => void;
  onTypeChange: (type: TransactionType) => void;
  /** false면 월 네비 스와이프 비활성 (모달 등) */
  swipeEnabled?: boolean;
}

export function StickyHeader({
  year,
  month,
  view,
  type,
  incomeTotal,
  expenseTotal,
  onPrevMonth,
  onNextMonth,
  onViewChange,
  onTypeChange,
  swipeEnabled = true,
}: StickyHeaderProps) {
  return (
    <header className="sticky-header">
      <SwipeableZone
        className="month-nav-swipe swipeable-zone"
        enabled={swipeEnabled}
        onPrev={onPrevMonth}
        onNext={onNextMonth}
      >
        <MonthNavigator
          year={year}
          month={month}
          onPrev={onPrevMonth}
          onNext={onNextMonth}
        />
      </SwipeableZone>
      <ViewTabs active={view} onChange={onViewChange} />
      {view !== 'memo' && (
        <FilterBar
          type={type}
          incomeTotal={incomeTotal}
          expenseTotal={expenseTotal}
          onTypeChange={onTypeChange}
        />
      )}
      <hr className="sticky-header__divider" />
    </header>
  );
}
