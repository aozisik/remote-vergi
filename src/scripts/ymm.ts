// Shared config for the YMM tasdik fee tool. Keep BRACKET keys in sync with
// worker/src/index.js (BRACKETS).
import { CONSTANTS_BY_YEAR, DEFAULT_TAX_YEAR } from './constants';

// Override at build time with PUBLIC_API_BASE if needed (e.g. *.workers.dev).
export const API_BASE =
  import.meta.env.PUBLIC_API_BASE ?? 'https://api.remotevergi.com';

export type Currency = 'TRY' | 'USD' | 'EUR' | 'GBP';

export const CURRENCIES: { code: Currency; label: string }[] = [
  { code: 'USD', label: 'USD ($)' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'GBP', label: 'GBP (£)' },
  { code: 'TRY', label: 'TL (₺)' },
];

// Reuse the calculator's default kur so the tool and hesaplayıcı agree.
const rates = CONSTANTS_BY_YEAR[DEFAULT_TAX_YEAR].defaults.currencyRates;
export const CURRENCY_RATES: Record<Currency, number> = {
  TRY: 1,
  USD: Number(rates.USD),
  EUR: Number(rates.EUR),
  GBP: Number(rates.GBP),
};

export interface Bracket {
  key: string;
  label: string;
  min: number; // yıllık ciro alt sınırı (TL)
  max: number; // üst sınır (dışlanan); son dilimde Infinity
}

// Yıllık ciro (hasılat) aralıkları. Tam tasdik ücreti resmi tarifede ciroya göre
// belirlenir; tek-konu indirim raporu da pratikte ciroyla güçlü korelasyon gösterir.
export const BRACKETS: Bracket[] = [
  { key: '0-1.5m', label: '0 - 1,5M TL', min: 0, max: 1_500_000 },
  { key: '1.5m-3m', label: '1,5M - 3M TL', min: 1_500_000, max: 3_000_000 },
  { key: '3m-6m', label: '3M - 6M TL', min: 3_000_000, max: 6_000_000 },
  { key: '6m-12m', label: '6M - 12M TL', min: 6_000_000, max: 12_000_000 },
  { key: '12m+', label: '12M TL ve üzeri', min: 12_000_000, max: Infinity },
];

// İndirim tutarı ~500.000 TL'yi aşınca YMM tasdiki zorunlu. Serbest çalışan için
// indirim kabaca kârın tamamı olduğundan, ~650.000 TL altı ciroda çoğu kişi için
// YMM zorunlu olmayabilir. Eşiği kullanıcıyı bilgilendirmek için tutuyoruz.
export const YMM_LIKELY_THRESHOLD_TRY = 650_000;

export interface BracketStat {
  n: number;
  min?: number;
  max?: number;
  median?: number;
  p25?: number;
  p75?: number;
  fees?: number[];
}

export interface Aggregates {
  brackets: Record<string, BracketStat>;
  total: number;
  updated_at: string;
}

export function annualTRY(monthly: number, currency: Currency): number {
  if (!Number.isFinite(monthly) || monthly <= 0) return 0;
  return Math.round(monthly * (CURRENCY_RATES[currency] ?? 1) * 12);
}

export function bracketForAnnual(annual: number): Bracket | null {
  if (!annual || annual <= 0) return null;
  return BRACKETS.find((b) => annual >= b.min && annual < b.max) ?? null;
}

// TL formatter (no decimals, TR grouping).
export const formatTL = (n: number): string =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(
    Math.round(n),
  ) + ' TL';

// Where does `fee` sit within a bracket's anonymous fee array? Returns 0-100.
export function percentileOf(fees: number[], fee: number): number {
  if (!fees || fees.length === 0) return 0;
  const below = fees.filter((f) => f <= fee).length;
  return Math.round((below / fees.length) * 100);
}
