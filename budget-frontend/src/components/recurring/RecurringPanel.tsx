// 반복 규칙 관리 패널 — 목록·자동 생성 안내
import { useState } from 'react';
import type { TransactionType } from '../../types/category';
import type { RecurringRule } from '../../types/recurring';
import { formatAmount } from '../../utils/format';
import { getCategoryDisplay } from '../../utils/transaction';
import { RecurringRuleForm } from './RecurringRuleForm';
import './RecurringPanel.css';

/** 목록에 표시할 반복 주기 문구 */
function formatScheduleLabel(rule: RecurringRule) {
  const interval = rule.intervalMonths ?? 1;
  const dayLabel = `매월 ${rule.dayOfMonth}일`;
  const intervalLabel =
    interval === 1 ? dayLabel : `${interval}개월마다 · ${rule.dayOfMonth}일`;

  if (rule.endDate) {
    const end = rule.endDate.slice(0, 10).replace(/-/g, '.');
    return `${intervalLabel} (~${end})`;
  }

  return intervalLabel;
}

interface RecurringPanelProps {
  open: boolean;
  year: number;
  month: number;
  filterType: TransactionType;
  rules: RecurringRule[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onGenerate: (
    year: number,
    month: number,
  ) => Promise<{ createdCount: number; skippedCount: number }>;
  onDelete: (id: string) => Promise<void>;
}

export function RecurringPanel({
  open,
  year,
  month,
  filterType,
  rules,
  loading,
  error,
  onClose,
  onRefresh,
  onGenerate,
  onDelete,
}: RecurringPanelProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;

  const visibleRules = rules.filter(
    (rule) => rule.isActive && rule.type === filterType,
  );

  async function handleGenerate() {
    setGenerating(true);
    setMessage(null);

    try {
      const summary = await onGenerate(year, month);
      setMessage(
        `${summary.createdCount}건 생성, ${summary.skippedCount}건 건너뜀 (이미 있음)`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('이 반복 규칙을 삭제할까요?')) return;
    await onDelete(id);
    setMessage(null);
  }

  function openCreateForm() {
    setEditingRule(null);
    setFormOpen(true);
  }

  function openEditForm(rule: RecurringRule) {
    setEditingRule(rule);
    setFormOpen(true);
  }

  async function handleSaved() {
    await onRefresh();
    try {
      await onGenerate(year, month);
    } catch {
      /* 자동 생성 실패는 목록 갱신만으로 충분 */
    }
    setMessage(null);
  }

  return (
    <>
      <div className="recurring-panel-overlay" onClick={onClose}>
        <div
          className="recurring-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recurring-panel-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="recurring-panel__header">
            <h2 id="recurring-panel-title" className="recurring-panel__title">
              반복 {filterType === 'income' ? '수입' : '지출'}
            </h2>
            <button type="button" className="recurring-panel__close" onClick={onClose}>
              ×
            </button>
          </header>

          <div className="recurring-panel__actions">
            <p className="recurring-panel__hint">
              월을 바꾸면 반복 내역이 자동으로 반영됩니다.
            </p>
            <button
              type="button"
              className="recurring-panel__generate recurring-panel__generate--secondary"
              disabled={generating || visibleRules.length === 0}
              onClick={handleGenerate}
            >
              {generating
                ? '생성 중...'
                : `${year}.${month} 수동 생성`}
            </button>
            <button type="button" className="recurring-panel__add" onClick={openCreateForm}>
              + 반복 추가
            </button>
          </div>

          {message && <p className="recurring-panel__message">{message}</p>}
          {error && <p className="recurring-panel__error">{error}</p>}

          {loading ? (
            <p className="recurring-panel__empty">불러오는 중...</p>
          ) : visibleRules.length === 0 ? (
            <p className="recurring-panel__empty">
              등록된 반복 {filterType === 'income' ? '수입' : '지출'}이 없습니다.
            </p>
          ) : (
            <ul className="recurring-panel__list">
              {visibleRules.map((rule) => {
                const category =
                  typeof rule.category === 'object' ? rule.category : null;
                const label = category
                  ? getCategoryDisplay(category).label
                  : '카테고리';

                return (
                  <li key={rule._id} className="recurring-panel__item">
                    <button
                      type="button"
                      className="recurring-panel__item-main"
                      onClick={() => openEditForm(rule)}
                    >
                      <span className="recurring-panel__day">
                        {formatScheduleLabel(rule)}
                      </span>
                      <span className="recurring-panel__memo">
                        {rule.memo || label}
                      </span>
                      <span
                        className={`recurring-panel__amount recurring-panel__amount--${rule.type}`}
                      >
                        {formatAmount(rule.amount)}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="recurring-panel__delete"
                      aria-label="삭제"
                      onClick={() => handleDelete(rule._id)}
                    >
                      삭제
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <RecurringRuleForm
        rule={editingRule}
        open={formOpen}
        defaultType={filterType}
        onClose={() => {
          setFormOpen(false);
          setEditingRule(null);
        }}
        onSaved={handleSaved}
      />
    </>
  );
}
