// 월별 메모 패널 — textarea 입력·저장
import { useMonthMemo } from '../../hooks/useMonthMemo';
import './MonthMemoPanel.css';

interface MonthMemoPanelProps {
  year: number;
  month: number;
}

/** ISO 시각을 짧은 표시용으로 변환 */
function formatSavedAt(iso: string | null) {
  if (!iso) return null;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MonthMemoPanel({ year, month }: MonthMemoPanelProps) {
  const {
    content,
    setContent,
    loading,
    saving,
    error,
    savedAt,
    save,
  } = useMonthMemo(year, month);

  const savedLabel = formatSavedAt(savedAt);

  if (loading) {
    return <p className="month-memo__message">불러오는 중...</p>;
  }

  return (
    <section className="month-memo" aria-label="월별 메모">
      <textarea
        className="month-memo__textarea"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="이번 달 메모를 입력하세요"
        rows={12}
        maxLength={10000}
      />

      <div className="month-memo__footer">
        <div className="month-memo__meta">
          {error && <p className="month-memo__error">{error}</p>}
          {!error && savedLabel && (
            <p className="month-memo__saved">마지막 저장: {savedLabel}</p>
          )}
        </div>
        <button
          type="button"
          className="month-memo__save-btn"
          onClick={() => void save()}
          disabled={saving}
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </section>
  );
}
