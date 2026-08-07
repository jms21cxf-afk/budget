// 거래 목록 페이지
import { useEffect, useMemo, useRef, useState } from 'react';
import { RecurringPanel } from '../components/recurring/RecurringPanel';
import { TransactionCalendar } from '../components/calendar/TransactionCalendar';
import { StickyHeader } from '../components/layout/StickyHeader';
import { TransactionMonthly } from '../components/monthly/TransactionMonthly';
import { TransactionForm } from '../components/transaction/TransactionForm';
import { TransactionList } from '../components/transaction/TransactionList';
import { SwipeableZone } from '../components/layout/SwipeableZone';
import { useAllCategories } from '../hooks/useAllCategories';
import { useRecurringRules } from '../hooks/useRecurringRules';
import { useTransactions } from '../hooks/useTransactions';
import type { TransactionType } from '../types/category';
import type { Transaction } from '../types/transaction';
import type { ViewMode } from '../utils/constants';
import { getCurrentYearMonth, shiftMonth } from '../utils/month';
import { sumAmountByType } from '../utils/transaction';
import './TransactionListPage.css';

export function TransactionListPage() {
  const initial = getCurrentYearMonth();
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [type, setType] = useState<TransactionType>('expense');
  const [view, setView] = useState<ViewMode>('list');
  const [formOpen, setFormOpen] = useState(false);
  const [formDefaultDate, setFormDefaultDate] = useState<string | null>(null);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(
    null,
  );

  const formVisible = formOpen || editingTransaction !== null;

  function closeForm() {
    setFormOpen(false);
    setFormDefaultDate(null);
    setEditingTransaction(null);
  }

  function openAddForm(date: string | null = null) {
    setFormDefaultDate(date);
    setFormOpen(true);
  }

  function handleCalendarDayClick(date: string) {
    openAddForm(date);
  }

  function handleSaved() {
    refetch();
    closeForm();
  }

  const { transactions, loading, error, refetch } = useTransactions({ year, month });
  const {
    rules: recurringRules,
    loading: recurringLoading,
    error: recurringError,
    refetch: refetchRecurring,
    removeRule,
    generateMonth,
  } = useRecurringRules();
  const { categories: allCategories } = useAllCategories();
  const incomeTotal = useMemo(
    () => sumAmountByType(transactions, 'income'),
    [transactions],
  );
  const expenseTotal = useMemo(
    () => sumAmountByType(transactions, 'expense'),
    [transactions],
  );

  function handleRecurringGenerate(monthYear: number, monthNum: number) {
    return generateMonth(monthYear, monthNum).then(async (summary) => {
      await refetch();
      return summary;
    });
  }

  // 월·탭 조회 시 해당 월 반복 내역 자동 생성 (일정앱처럼)
  const autoGenKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (recurringLoading) return;

    const key = `${year}-${month}`;
    if (autoGenKeyRef.current === key) return;
    autoGenKeyRef.current = key;

    generateMonth(year, month)
      .then(() => refetch())
      .catch(() => {
        autoGenKeyRef.current = null;
      });
  }, [year, month, recurringLoading, generateMonth, refetch]);

  function goPrevMonth() {
    const next = shiftMonth(year, month, -1);
    setYear(next.year);
    setMonth(next.month);
  }

  function goNextMonth() {
    const next = shiftMonth(year, month, 1);
    setYear(next.year);
    setMonth(next.month);
  }

  return (
    <div className="list-page">
      <StickyHeader
        year={year}
        month={month}
        view={view}
        type={type}
        incomeTotal={incomeTotal}
        expenseTotal={expenseTotal}
        onPrevMonth={goPrevMonth}
        onNextMonth={goNextMonth}
        onViewChange={setView}
        onTypeChange={setType}
        swipeEnabled={!formVisible && !recurringOpen}
      />

      <div className="list-page__toolbar">
        <button
          type="button"
          className="list-page__recurring-btn"
          onClick={() => setRecurringOpen(true)}
        >
          반복
        </button>
      </div>

      <SwipeableZone
        className="list-page__body swipeable-zone"
        enabled={!formVisible && !recurringOpen}
        onPrev={goPrevMonth}
        onNext={goNextMonth}
      >
        {view === 'list' && (
          <TransactionList
            transactions={transactions}
            filterType={type}
            allCategories={allCategories}
            loading={loading}
            error={error}
            onEdit={setEditingTransaction}
          />
        )}

        {view === 'calendar' && (
          <TransactionCalendar
            year={year}
            month={month}
            transactions={transactions}
            filterType={type}
            loading={loading}
            error={error}
            onDayClick={handleCalendarDayClick}
          />
        )}

        {view === 'monthly' && (
          <TransactionMonthly
            year={year}
            month={month}
            transactions={transactions}
            incomeTotal={incomeTotal}
            expenseTotal={expenseTotal}
            loading={loading}
            error={error}
          />
        )}
      </SwipeableZone>

      {(view === 'list' || view === 'calendar') && (
        <button
          type="button"
          className="add-tx-btn"
          aria-label="내역 추가"
          onClick={() => openAddForm()}
        >
          +
        </button>
      )}

      <TransactionForm
        defaultType={type}
        defaultDate={formDefaultDate}
        transaction={editingTransaction}
        open={formVisible}
        onClose={closeForm}
        onSaved={handleSaved}
      />

      <RecurringPanel
        open={recurringOpen}
        year={year}
        month={month}
        filterType={type}
        rules={recurringRules}
        loading={recurringLoading}
        error={recurringError}
        onClose={() => setRecurringOpen(false)}
        onRefresh={refetchRecurring}
        onGenerate={handleRecurringGenerate}
        onDelete={removeRule}
      />
    </div>
  );
}
