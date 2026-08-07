// 통계 화면 — 수입·지출, 카테고리별·월별·연별 집계
import { useMemo, useState } from 'react';
import { StatsCategoryBreakdown } from '../components/stats/StatsCategoryBreakdown';
import { StatsMonthlyBreakdown } from '../components/stats/StatsMonthlyBreakdown';
import { StatsYearlyBreakdown } from '../components/stats/StatsYearlyBreakdown';
import { StatsViewTabs, type StatsView } from '../components/stats/StatsViewTabs';
import { MonthNavigator } from '../components/layout/MonthNavigator';
import { SwipeableZone } from '../components/layout/SwipeableZone';
import { useCategories } from '../hooks/useCategories';
import { useStatsTransactions } from '../hooks/useStatsTransactions';
import type { TransactionType } from '../types/category';
import { formatYearLabel } from '../utils/format';
import { getCurrentYearMonth, shiftMonth, shiftYear } from '../utils/month';
import { aggregateByCategory, aggregateByMonth, aggregateByYear } from '../utils/stats';
import './StatisticsPage.css';

export function StatisticsPage() {
  const initial = getCurrentYearMonth();
  const [type, setType] = useState<TransactionType>('expense');
  const [view, setView] = useState<StatsView>('category');
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);

  const { categories, loading: categoriesLoading } = useCategories(type);
  const { transactions, loading: transactionsLoading, error } = useStatsTransactions({
    type,
    year,
    month,
    view,
  });

  const categoryLoading = transactionsLoading || categoriesLoading;
  const tableLoading = transactionsLoading;

  const categoryItems = useMemo(
    () => aggregateByCategory(transactions, type, categories),
    [transactions, type, categories],
  );

  const monthlyItems = useMemo(
    () => aggregateByMonth(transactions, type, year),
    [transactions, type, year],
  );

  const yearlyItems = useMemo(
    () => aggregateByYear(transactions, type),
    [transactions, type],
  );

  function goPrevPeriod() {
    if (view === 'category') {
      const next = shiftMonth(year, month, -1);
      setYear(next.year);
      setMonth(next.month);
      return;
    }

    if (view === 'monthly') {
      setYear(shiftYear(year, -1));
    }
  }

  function goNextPeriod() {
    if (view === 'category') {
      const next = shiftMonth(year, month, 1);
      setYear(next.year);
      setMonth(next.month);
      return;
    }

    if (view === 'monthly') {
      setYear(shiftYear(year, 1));
    }
  }

  const swipeEnabled = view === 'category' || view === 'monthly';

  return (
    <SwipeableZone
      className="stats-page swipeable-zone"
      enabled={swipeEnabled}
      onPrev={goPrevPeriod}
      onNext={goNextPeriod}
    >
      <header className="stats-page__header">
        <div className="stats-page__type-toggle" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={type === 'income'}
            className={`stats-page__type-btn${type === 'income' ? ' is-active' : ''}`}
            onClick={() => setType('income')}
          >
            수입
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={type === 'expense'}
            className={`stats-page__type-btn${type === 'expense' ? ' is-active' : ''}`}
            onClick={() => setType('expense')}
          >
            지출
          </button>
        </div>

        <StatsViewTabs active={view} onChange={setView} />

        {view === 'category' && (
          <MonthNavigator
            year={year}
            month={month}
            onPrev={goPrevPeriod}
            onNext={goNextPeriod}
          />
        )}

        {view === 'monthly' && (
          <nav className="stats-page__year-nav" aria-label="연도 선택">
            <button type="button" className="stats-page__year-btn" onClick={goPrevPeriod}>
              &lt;
            </button>
            <span className="stats-page__year-label">{formatYearLabel(year)}</span>
            <button type="button" className="stats-page__year-btn" onClick={goNextPeriod}>
              &gt;
            </button>
          </nav>
        )}

        <hr className="stats-page__divider" />
      </header>

      <div className="stats-page__body">
        {view === 'category' && (
          <StatsCategoryBreakdown
            items={categoryItems}
            type={type}
            loading={categoryLoading}
            error={error}
          />
        )}

        {view === 'monthly' && (
          <StatsMonthlyBreakdown
            items={monthlyItems}
            type={type}
            loading={tableLoading}
            error={error}
          />
        )}

        {view === 'yearly' && (
          <StatsYearlyBreakdown
            items={yearlyItems}
            type={type}
            loading={tableLoading}
            error={error}
          />
        )}
      </div>
    </SwipeableZone>
  );
}
