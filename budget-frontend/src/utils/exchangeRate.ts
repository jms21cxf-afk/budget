// 외화 → 원화 환산 (Frankfurter API + 오프라인 fallback)

const CACHE_MS = 60 * 60 * 1000;

/** API 실패 시 대략적 환율 (1 외화 = N 원) */
const FALLBACK_RATES: Record<string, number> = {
  USD: 1380,
  EUR: 1480,
  JPY: 9.2,
  CNY: 190,
  GBP: 1750,
  HKD: 177,
  TWD: 43,
  THB: 40,
  VND: 0.055,
  AUD: 900,
  CAD: 1000,
  SGD: 1030,
  CHF: 1580,
  NZD: 830,
  PHP: 24,
  MYR: 310,
  IDR: 0.087,
};

const rateCache = new Map<string, { rate: number; fetchedAt: number }>();

/** 1 외화 단위당 원화 환율 */
async function getRateToKrw(currency: string): Promise<number> {
  const code = currency.toUpperCase();
  if (code === 'KRW') return 1;

  const cached = rateCache.get(code);
  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
    return cached.rate;
  }

  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${code}&to=KRW`,
    );
    if (!response.ok) throw new Error('환율 API 오류');

    const data = (await response.json()) as { rates: { KRW: number } };
    const rate = data.rates.KRW;
    rateCache.set(code, { rate, fetchedAt: Date.now() });
    return rate;
  } catch {
    const fallback = FALLBACK_RATES[code];
    if (fallback !== undefined) return fallback;
    throw new Error(`${code} 환율을 조회할 수 없습니다.`);
  }
}

/** 외화 금액 → 원화 (반올림) */
export async function convertToKrw(
  amount: number,
  currency: string,
): Promise<number> {
  const code = currency.toUpperCase();
  if (code === 'KRW') return Math.round(amount);

  const rate = await getRateToKrw(code);
  return Math.round(amount * rate);
}
