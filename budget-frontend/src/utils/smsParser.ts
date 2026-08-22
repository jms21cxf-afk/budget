// 결제·입금 알림 문자 파싱 — 붙여넣기 전용 (SMS 권한 불필요)
import type { TransactionType } from '../types/category';
import type { PaymentMethod } from '../types/transaction';
import { convertToKrw } from './exchangeRate';

/** 지원 외화 코드 (카드 해외승인 문자) */
const CURRENCY_CODES =
  'USD|EUR|JPY|CNY|GBP|HKD|TWD|THB|VND|AUD|CAD|SGD|CHF|NZD|PHP|MYR|IDR';
const CURRENCY_RE = new RegExp(CURRENCY_CODES, 'i');

/** 파싱 결과 — 없는 필드는 undefined */
export interface SmsParseResult {
  type?: TransactionType;
  amount?: number;
  /** YYYY-MM-DD */
  date?: string;
  /** HH:MM */
  time?: string;
  memo?: string;
  paymentMethod?: PaymentMethod;
}

/** 파싱 성공 여부와 사용자 안내 메시지 */
export interface SmsParseOutcome {
  result: SmsParseResult;
  /** 자동 채운 항목 요약 (예: "금액, 날짜, 메모") */
  filledFields: string[];
  /** 파싱 실패 또는 부분 성공 안내 */
  message: string;
}

/** 금액 문자열 → 숫자 (쉼표 제거) */
function toAmount(raw: string): number {
  return Number(raw.replace(/,/g, ''));
}

/** MM/DD → YYYY-MM-DD (연도 추론) */
function resolveDateYear(month: number, day: number): number {
  const now = new Date();
  const year = now.getFullYear();
  const candidate = new Date(year, month - 1, day);

  // 30일 이상 미래면 작년 거래로 간주 (연말·연초 문자)
  if (candidate.getTime() - now.getTime() > 30 * 24 * 60 * 60 * 1000) {
    return year - 1;
  }
  return year;
}

/** 금액 추출 — "12,500원", "12500 원" 등 */
function parseAmount(text: string): number | undefined {
  const matches = [...text.matchAll(/(\d{1,3}(?:,\d{3})+|\d+)\s*원/g)];
  if (matches.length === 0) return undefined;

  // 잔액·한도 등 부가 금액 제외 — 첫 번째 금액을 거래액으로 사용
  const first = toAmount(matches[0][1]);
  return first >= 1 ? first : undefined;
}

/** 해외승인 외화 — "해외승인 USD 5.50", "USD 5.50" 등 */
function parseForeignAmount(
  text: string,
): { currency: string; amount: number } | undefined {
  const patterns = [
    new RegExp(
      `(?:해외\\s*승인|해외|외화)\\s*(${CURRENCY_CODES})\\s*([\\d,]+(?:\\.\\d+)?)`,
      'i',
    ),
    new RegExp(`(${CURRENCY_CODES})\\s*([\\d,]+(?:\\.\\d+)?)`, 'i'),
    new RegExp(`([\\d,]+(?:\\.\\d+)?)\\s*(${CURRENCY_CODES})`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    const [, first, second] = match;
    const currency = CURRENCY_RE.test(first) ? first : second;
    const amountRaw = CURRENCY_RE.test(first) ? second : first;
    const amount = Number(amountRaw.replace(/,/g, ''));

    if (amount >= 0.01) {
      return { currency: currency.toUpperCase(), amount };
    }
  }

  return undefined;
}

/** 날짜·시간 추출 */
function parseDateTime(text: string): { date?: string; time?: string } {
  // YYYY-MM-DD HH:MM
  const full = text.match(
    /(\d{4})[-/.](\d{2})[-/.](\d{2})[ T](\d{1,2}):(\d{2})/,
  );
  if (full) {
    const [, y, m, d, h, min] = full;
    return {
      date: `${y}-${m}-${d}`,
      time: `${h.padStart(2, '0')}:${min}`,
    };
  }

  // MM/DD HH:MM 또는 MM.DD HH:MM
  const short = text.match(/(\d{2})[/.](\d{2})\s+(\d{1,2}):(\d{2})/);
  if (short) {
    const [, mm, dd, h, min] = short;
    const month = Number(mm);
    const day = Number(dd);
    const year = resolveDateYear(month, day);
    return {
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      time: `${h.padStart(2, '0')}:${min}`,
    };
  }

  // 날짜만 (MM/DD)
  const dateOnly = text.match(/(\d{2})[/.](\d{2})(?!\s*:\d{2})/);
  if (dateOnly) {
    const [, mm, dd] = dateOnly;
    const month = Number(mm);
    const day = Number(dd);
    const year = resolveDateYear(month, day);
    return {
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    };
  }

  return {};
}

/** 키워드로 수입/지출 추론 */
function parseType(text: string): TransactionType | undefined {
  if (/입금|급여|이자|배당|환급|취소\s*입금|승인\s*취소|취소\s*완료/i.test(text)) {
    // "승인"만 있으면 지출 — "승인 취소"는 수입(환불)
    if (/승인\s*취소|취소\s*(?:입금|완료|처리)/i.test(text)) {
      return 'income';
    }
    if (/^[^\n]*입금|급여|이자|배당|환급/i.test(text)) {
      return 'income';
    }
  }
  if (/승인|출금|결제|사용|체크|구매|지출|인출/i.test(text)) {
    return 'expense';
  }
  return undefined;
}

/** 키워드로 결제 수단 추론 */
function parsePaymentMethod(text: string): PaymentMethod | undefined {
  if (/체크(?:카드)?|직불/i.test(text)) return 'check_card';
  if (/카카오|토스|네이버\s*페이|페이코|삼성\s*페이|간편\s*결제|페이\b/i.test(text)) {
    return 'mobile';
  }
  if (/계좌|이체|출금|인출|송금/i.test(text)) return 'transfer';
  if (/현금|ATM\s*출금/i.test(text)) return 'cash';
  if (/승인|일시불|할부|신용|카드/i.test(text)) return 'card';
  return undefined;
}

/** 은행·카드사 헤더·금액·날짜 등 노이즈 줄인지 판별 */
function isNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;

  return (
    /^\[.+\]$/.test(trimmed) ||
    /^(?:KB|NH|신한|하나|우리|삼성|현대|롯데|BC|카카오|토스|IBK|SC|씨티|수협|새마을|전북|광주|제주)/i.test(
      trimmed,
    ) ||
    /승인$|일시불$|할부$|체크$/i.test(trimmed) ||
    /^\d{1,3}(?:,\d{3})+\s*원/.test(trimmed) ||
    /^\d+\s*원/.test(trimmed) ||
    /(?:해외\s*승인|해외|외화)/i.test(trimmed) ||
    new RegExp(`^(?:${CURRENCY_CODES})\\s*[\\d,]+(?:\\.\\d+)?$`, 'i').test(trimmed) ||
    new RegExp(`^[\\d,]+(?:\\.\\d+)?\\s*(?:${CURRENCY_CODES})$`, 'i').test(
      trimmed,
    ) ||
    /^\d{2}[/.]\d{2}/.test(trimmed) ||
    /^[\d*]+원?\s*(?:일시불|할부|\d+개월)?$/.test(trimmed) ||
    /^[\*●○·]+/.test(trimmed) ||
    /^[\d\-*]{4,}$/.test(trimmed) ||
    /잔액|한도|누적|포인트|마감/i.test(trimmed) ||
    /^[\p{L}\*]{1,3}$/u.test(trimmed) // 마스킹된 이름 (김*수)
  );
}

/** 가맹점·메모 — 의미 있는 마지막 줄 우선 */
function parseMemo(text: string): string | undefined {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const candidates = lines.filter((line) => !isNoiseLine(line));
  if (candidates.length === 0) return undefined;

  // 보통 가맹점명이 금액·날짜 다음 줄에 옴
  const last = candidates[candidates.length - 1];
  return last.slice(0, 200);
}

/** 붙여넣은 결제 문자 분석 (해외승인 시 환율 API로 원화 환산) */
export async function parseSmsText(raw: string): Promise<SmsParseOutcome> {
  const text = raw.trim();

  if (!text) {
    return {
      result: {},
      filledFields: [],
      message: '문자 내용을 붙여넣어 주세요.',
    };
  }

  const result: SmsParseResult = {};
  const filledFields: string[] = [];
  let amountNote = '';

  // 원화 금액 우선 — 같은 문자에 원·외화가 함께 있으면 청구 원화 사용
  const krwAmount = parseAmount(text);
  if (krwAmount !== undefined) {
    result.amount = krwAmount;
    filledFields.push('금액');
  } else {
    const foreign = parseForeignAmount(text);
    if (foreign) {
      try {
        const converted = await convertToKrw(foreign.amount, foreign.currency);
        result.amount = converted;
        filledFields.push('금액');
        amountNote = ` (${foreign.currency} ${foreign.amount.toLocaleString('ko-KR')} → ${converted.toLocaleString('ko-KR')}원)`;
      } catch (error) {
        return {
          result: {},
          filledFields: [],
          message:
            error instanceof Error
              ? error.message
              : '환율 조회에 실패했습니다. 금액을 직접 입력해 주세요.',
        };
      }
    }
  }

  const { date, time } = parseDateTime(text);
  if (date) {
    result.date = date;
    filledFields.push('날짜');
  }
  if (time) {
    result.time = time;
    filledFields.push('시간');
  }

  const memo = parseMemo(text);
  if (memo) {
    result.memo = memo;
    filledFields.push('메모');
  }

  const type = parseType(text);
  if (type) {
    result.type = type;
    filledFields.push('유형');
  }

  const paymentMethod = parsePaymentMethod(text);
  if (paymentMethod) {
    result.paymentMethod = paymentMethod;
    filledFields.push('결제');
  }

  if (filledFields.length === 0) {
    return {
      result,
      filledFields,
      message: '인식할 수 없는 형식입니다. 직접 입력해 주세요.',
    };
  }

  return {
    result,
    filledFields,
    message: `${filledFields.join(', ')}을(를) 채웠습니다.${amountNote} 카테고리를 확인해 주세요.`,
  };
}
