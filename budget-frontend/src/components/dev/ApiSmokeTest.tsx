// API 연결 스모크 테스트 — dev에서 버튼으로 백엔드 호출 확인
import { useState } from 'react';
import { getCategories, getTransactions } from '../../api';
import { apiFetch } from '../../api/client';
import './ApiSmokeTest.css';

export function ApiSmokeTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function run(label: string, task: () => Promise<unknown>) {
    setLoading(true);
    setResult(`${label} 요청 중...`);

    try {
      const data = await task();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(err instanceof Error ? err.message : '요청 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="api-smoke">
      <h2>API 연결 테스트</h2>
      <p className="api-smoke__hint">
        프론트 → Vite proxy(/api) → 백엔드(3001)
      </p>

      <div className="api-smoke__buttons">
        <button
          type="button"
          disabled={loading}
          onClick={() => run('health', () => apiFetch('/health'))}
        >
          Health
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => run('categories', () => getCategories('expense'))}
        >
          Categories
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            run('transactions', () =>
              getTransactions({ type: 'expense', year: 2026, month: 8 }),
            )
          }
        >
          Transactions
        </button>
      </div>

      <pre className="api-smoke__result">{result || '버튼을 눌러 테스트하세요.'}</pre>
    </section>
  );
}
