// 거래 입력·수정 폼 — + 추가 / 메모 클릭 수정
import { useEffect, useMemo, useState } from 'react';
import type { ClipboardEvent, FormEvent } from 'react';
import { createTransaction, deleteTransaction, updateTransaction } from '../../api/transactions';
import { useCategories } from '../../hooks/useCategories';
import type { TransactionType } from '../../types/category';
import type { PaymentMethod, Transaction } from '../../types/transaction';
import { PAYMENT_METHOD_LABELS } from '../../utils/constants';
import {
  getNowTimeString,
  getSelectableCategories,
  getTodayDateString,
  getTransactionCategoryId,
  isCategoryOptionValid,
  parseOccurredAt,
  toOccurredAt,
} from '../../utils/form';
import { parseSmsText } from '../../utils/smsParser';
import './TransactionForm.css';

interface TransactionFormProps {
  defaultType?: TransactionType;
  /** 달력에서 선택한 날짜 (YYYY-MM-DD) */
  defaultDate?: string | null;
  transaction?: Transaction | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const PAYMENT_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS) as [
  PaymentMethod,
  string,
][];

export function TransactionForm({
  defaultType = 'expense',
  defaultDate = null,
  transaction = null,
  open,
  onClose,
  onSaved,
}: TransactionFormProps) {
  const isEdit = transaction !== null;
  const [formType, setFormType] = useState<TransactionType>(defaultType);
  const { categories, loading: categoriesLoading } = useCategories(formType);
  const categoryOptions = useMemo(
    () => getSelectableCategories(categories),
    [categories],
  );

  const [date, setDate] = useState(getTodayDateString);
  const [time, setTime] = useState(getNowTimeString);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 추가 모드 — 결제 문자 붙여넣기
  const [smsOpen, setSmsOpen] = useState(false);
  const [smsText, setSmsText] = useState('');
  const [smsHint, setSmsHint] = useState<string | null>(null);

  // 모달 열릴 때 폼 초기화 (추가 / 수정)
  useEffect(() => {
    if (!open) return;

    setError(null);
    setSmsOpen(false);
    setSmsText('');
    setSmsHint(null);

    if (transaction) {
      const parsed = parseOccurredAt(transaction.occurredAt);
      setFormType(transaction.type);
      setDate(parsed.date);
      setTime(parsed.time);
      setAmount(String(transaction.amount));
      setMemo(transaction.memo);
      setPaymentMethod(transaction.paymentMethod);
      setCategoryId(getTransactionCategoryId(transaction));
      return;
    }

    setFormType(defaultType);
    setDate(defaultDate ?? getTodayDateString());
    setTime(getNowTimeString());
    setAmount('');
    setMemo('');
    setPaymentMethod('cash');
    setCategoryId('');
  }, [open, defaultType, defaultDate, transaction]);

  // 추가 모드: 카테고리 첫 항목 자동 선택
  useEffect(() => {
    if (!open || isEdit || categoryOptions.length === 0) return;
    setCategoryId(categoryOptions[0].id);
  }, [open, isEdit, formType, categoryOptions]);

  const selectValue = isCategoryOptionValid(categoryId, categoryOptions)
    ? categoryId
    : '';

  if (!open) return null;

  /** 붙여넣은 결제 문자 → 폼 필드 자동 채움 */
  function applySmsParse(text: string) {
    const { result, filledFields, message } = parseSmsText(text);
    setSmsHint(message);

    if (filledFields.length === 0) return;

    if (result.type) setFormType(result.type);
    if (result.amount !== undefined) setAmount(String(result.amount));
    if (result.date) setDate(result.date);
    if (result.time) setTime(result.time);
    if (result.memo) setMemo(result.memo);
    if (result.paymentMethod) setPaymentMethod(result.paymentMethod);
  }

  function handleSmsPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = event.clipboardData.getData('text');
    if (!pasted.trim()) return;

    // 붙여넣기 직후 textarea 값 반영을 위해 다음 틱에 파싱
    window.setTimeout(() => applySmsParse(pasted), 0);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const parsedAmount = Number(amount.replace(/,/g, ''));
    const resolvedCategoryId = isCategoryOptionValid(categoryId, categoryOptions)
      ? categoryId
      : selectValue;

    if (!resolvedCategoryId) {
      setError('카테고리를 선택해 주세요.');
      return;
    }
    if (!parsedAmount || parsedAmount < 1) {
      setError('금액을 입력해 주세요.');
      return;
    }

    const payload = {
      type: formType,
      amount: parsedAmount,
      occurredAt: toOccurredAt(date, time),
      category: resolvedCategoryId,
      paymentMethod,
      memo: memo.trim(),
    };

    setSubmitting(true);

    try {
      if (transaction) {
        await updateTransaction(transaction._id, payload);
      } else {
        await createTransaction(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!transaction) return;
    if (!window.confirm('이 내역을 삭제할까요?')) return;

    setError(null);
    setDeleting(true);

    try {
      await deleteTransaction(transaction._id);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  }

  const busy = submitting || deleting;

  return (
    <div className="tx-form-overlay" onClick={onClose}>
      <div
        className="tx-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="tx-form__header">
          <div
            id="tx-form-title"
            className="tx-form__type-toggle"
            role="tablist"
            aria-label="수입 또는 지출"
          >
            <button
              type="button"
              role="tab"
              aria-selected={formType === 'income'}
              className={`tx-form__type-btn${formType === 'income' ? ' is-active' : ''}`}
              onClick={() => setFormType('income')}
            >
              수입
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={formType === 'expense'}
              className={`tx-form__type-btn${formType === 'expense' ? ' is-active' : ''}`}
              onClick={() => setFormType('expense')}
            >
              지출
            </button>
          </div>
          <button type="button" className="tx-form__close" onClick={onClose}>
            ×
          </button>
        </header>

        <form className="tx-form__body" onSubmit={handleSubmit}>
          {!isEdit && (
            <div className="tx-form__sms">
              <button
                type="button"
                className="tx-form__sms-toggle"
                aria-expanded={smsOpen}
                onClick={() => setSmsOpen((prev) => !prev)}
              >
                {smsOpen ? '문자 입력 닫기' : '문자에서 붙여넣기'}
              </button>

              {smsOpen && (
                <div className="tx-form__sms-panel">
                  <p className="tx-form__sms-desc">
                    결제 알림 문자를 복사해 붙여넣으면 금액·날짜 등이 자동으로
                    채워집니다. (문자함 접근 권한 불필요)
                  </p>
                  <textarea
                    className="tx-form__sms-input"
                    rows={5}
                    placeholder="[KB국민] 승인&#10;12,500원 일시불&#10;07/15 14:32&#10;스타벅스강남점"
                    value={smsText}
                    onChange={(event) => setSmsText(event.target.value)}
                    onPaste={handleSmsPaste}
                  />
                  <button
                    type="button"
                    className="tx-form__sms-parse"
                    onClick={() => applySmsParse(smsText)}
                  >
                    분석하기
                  </button>
                  {smsHint && (
                    <p
                      className={`tx-form__sms-hint${smsHint.includes('인식') ? ' is-error' : ''}`}
                    >
                      {smsHint}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <label className="tx-form__field">
            <span>날짜</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label className="tx-form__field">
            <span>시간</span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </label>

          <label className="tx-form__field">
            <span>카테고리</span>
            <select
              value={selectValue}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={categoriesLoading || categoryOptions.length === 0}
              required
            >
              {!selectValue && (
                <option value="">
                  {isEdit ? '카테고리를 다시 선택하세요' : '카테고리 선택'}
                </option>
              )}
              {categoryOptions.length === 0 ? (
                <option value="">카테고리 없음 (seed 실행 필요)</option>
              ) : (
                categoryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="tx-form__field">
            <span>금액</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>

          <label className="tx-form__field">
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

          <label className="tx-form__field">
            <span>메모</span>
            <input
              type="text"
              placeholder="내역을 입력하세요"
              maxLength={200}
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
            />
          </label>

          {error && <p className="tx-form__error">{error}</p>}

          <div className={`tx-form__actions${isEdit ? ' tx-form__actions--edit' : ''}`}>
            {isEdit && (
              <button
                type="button"
                className="tx-form__delete"
                disabled={busy || categoryOptions.length === 0}
                onClick={handleDelete}
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            )}
            <button
              type="submit"
              className="tx-form__submit"
              disabled={busy || categoryOptions.length === 0}
            >
              {submitting ? '저장 중...' : isEdit ? '수정' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
