// 반복 규칙 입력·수정 폼 — 매월 주기·종료일 설정
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createRecurringRule,
  updateRecurringRule,
} from '../../api/recurringRules';
import { useCategories } from '../../hooks/useCategories';
import type { TransactionType } from '../../types/category';
import type { PaymentMethod } from '../../types/transaction';
import type { RecurringRule } from '../../types/recurring';
import { PAYMENT_METHOD_LABELS } from '../../utils/constants';
import {
  getSelectableCategories,
  isCategoryOptionValid,
} from '../../utils/form';
import './RecurringRuleForm.css';

interface RecurringRuleFormProps {
  rule?: RecurringRule | null;
  open: boolean;
  defaultType?: TransactionType;
  onClose: () => void;
  onSaved: () => void;
}

const PAYMENT_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS) as [
  PaymentMethod,
  string,
][];

const INTERVAL_OPTIONS = [1, 2, 3, 4, 6, 12];

/** ISO 날짜 문자열 → input[type=date] 값 */
function toDateInputValue(iso?: string | null) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function RecurringRuleForm({
  rule = null,
  open,
  defaultType = 'expense',
  onClose,
  onSaved,
}: RecurringRuleFormProps) {
  const isEdit = rule !== null;
  const [formType, setFormType] = useState<TransactionType>(defaultType);
  const { categories, loading: categoriesLoading } = useCategories(formType);
  const categoryOptions = useMemo(
    () => getSelectableCategories(categories),
    [categories],
  );

  const [intervalMonths, setIntervalMonths] = useState('1');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setError(null);

    if (rule) {
      setFormType(rule.type);
      setIntervalMonths(String(rule.intervalMonths ?? 1));
      setDayOfMonth(String(rule.dayOfMonth));
      setEndDate(toDateInputValue(rule.endDate));
      setAmount(String(rule.amount));
      setMemo(rule.memo);
      setPaymentMethod(rule.paymentMethod);
      setCategoryId(
        typeof rule.category === 'object' ? rule.category._id : String(rule.category),
      );
      return;
    }

    setFormType(defaultType);
    setIntervalMonths('1');
    setDayOfMonth('1');
    setEndDate('');
    setAmount('');
    setMemo('');
    setPaymentMethod('card');
    setCategoryId('');
  }, [open, defaultType, rule]);

  useEffect(() => {
    if (!open || isEdit || categoryOptions.length === 0) return;
    setCategoryId(categoryOptions[0].id);
  }, [open, isEdit, formType, categoryOptions]);

  const selectValue = isCategoryOptionValid(categoryId, categoryOptions)
    ? categoryId
    : '';

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const parsedInterval = Number(intervalMonths);
    const parsedDay = Number(dayOfMonth);
    const parsedAmount = Number(amount.replace(/,/g, ''));
    const resolvedCategoryId = isCategoryOptionValid(categoryId, categoryOptions)
      ? categoryId
      : selectValue;

    if (!resolvedCategoryId) {
      setError('카테고리를 선택해 주세요.');
      return;
    }
    if (!parsedDay || parsedDay < 1 || parsedDay > 31) {
      setError('날짜(1~31)를 입력해 주세요.');
      return;
    }
    if (!parsedInterval || parsedInterval < 1) {
      setError('반복 주기를 선택해 주세요.');
      return;
    }
    if (!parsedAmount || parsedAmount < 1) {
      setError('금액을 입력해 주세요.');
      return;
    }

    const payload = {
      type: formType,
      amount: parsedAmount,
      category: resolvedCategoryId,
      paymentMethod,
      memo: memo.trim(),
      dayOfMonth: parsedDay,
      intervalMonths: parsedInterval,
      endDate: endDate || null,
      isActive: true,
    };

    setSubmitting(true);

    try {
      if (rule) {
        await updateRecurringRule(rule._id, payload);
      } else {
        await createRecurringRule(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="recurring-form-overlay" onClick={onClose}>
      <div
        className="recurring-form"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="recurring-form__header">
          <h2 className="recurring-form__title">
            {isEdit ? '반복 수정' : '반복 추가'}
          </h2>
          <button type="button" className="recurring-form__close" onClick={onClose}>
            ×
          </button>
        </header>

        <form className="recurring-form__body" onSubmit={handleSubmit}>
          <div className="recurring-form__type-toggle" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={formType === 'income'}
              className={`recurring-form__type-btn${formType === 'income' ? ' is-active' : ''}`}
              onClick={() => setFormType('income')}
            >
              수입
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={formType === 'expense'}
              className={`recurring-form__type-btn${formType === 'expense' ? ' is-active' : ''}`}
              onClick={() => setFormType('expense')}
            >
              지출
            </button>
          </div>

          <p className="recurring-form__section-label">매월</p>

          <div className="recurring-form__schedule-panel">
            <label className="recurring-form__field">
              <span>반복 주기</span>
              <select
                value={intervalMonths}
                onChange={(event) => setIntervalMonths(event.target.value)}
              >
                {INTERVAL_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value === 1 ? '매월 (1개월마다)' : `${value}개월마다`}
                  </option>
                ))}
              </select>
            </label>

            <label className="recurring-form__field">
              <span>매월 며칠</span>
              <input
                type="number"
                min={1}
                max={31}
                value={dayOfMonth}
                onChange={(event) => setDayOfMonth(event.target.value)}
                required
              />
            </label>

            <label className="recurring-form__field">
              <span>종료일 (비우면 무기한)</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
          </div>

          <label className="recurring-form__field">
            <span>카테고리</span>
            <select
              value={selectValue}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={categoriesLoading || categoryOptions.length === 0}
              required
            >
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="recurring-form__field">
            <span>금액</span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>

          <label className="recurring-form__field">
            <span>결제</span>
            <select
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(event.target.value as PaymentMethod)
              }
            >
              {PAYMENT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="recurring-form__field">
            <span>메모</span>
            <input
              type="text"
              maxLength={200}
              placeholder="Netflix"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
            />
          </label>

          {error && <p className="recurring-form__error">{error}</p>}

          <button type="submit" className="recurring-form__submit" disabled={submitting}>
            {submitting ? '저장 중...' : isEdit ? '수정' : '저장'}
          </button>
        </form>
      </div>
    </div>
  );
}
