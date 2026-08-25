// 월별 메모 hook — 조회·편집·저장
import { useCallback, useEffect, useState } from 'react';
import { getMonthMemo, upsertMonthMemo } from '../api/monthMemos';

interface UseMonthMemoResult {
  content: string;
  setContent: (value: string) => void;
  loading: boolean;
  saving: boolean;
  error: string | null;
  savedAt: string | null;
  save: () => Promise<void>;
}

export function useMonthMemo(year: number, month: number): UseMonthMemoResult {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMonthMemo({ year, month });
      setContent(data.content);
      setSavedAt(data.updatedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : '불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const data = await upsertMonthMemo({ year, month, content });
      setContent(data.content);
      setSavedAt(data.updatedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  }, [year, month, content]);

  return {
    content,
    setContent,
    loading,
    saving,
    error,
    savedAt,
    save,
  };
}
