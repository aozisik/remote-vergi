import type { ForeignCurrency } from './support/money';

export type TaxYear = 2025 | 2026;

export interface YearConstants {
  taxBrackets: [number, number][];
  bagkurPremium: number;
  annualStampTax: number;
  serviceExportExemption: number;
  // null when YMM tasdik raporu zorunluluğu yok (2025 öncesi gibi)
  ymmThreshold: number | null;
  defaults: {
    accountingCost: string;
    ymmCost: string;
    currencyRates: Record<ForeignCurrency, string>;
  };
}

export const TAX_YEARS: TaxYear[] = [2025, 2026];
export const DEFAULT_TAX_YEAR: TaxYear = 2026;

export const CONSTANTS_BY_YEAR: Record<TaxYear, YearConstants> = {
  2025: {
    // 2025 ücret dışı gelir vergisi tarifesi (GVK 329 No'lu Tebliğ)
    taxBrackets: [
      [158_000, 0.15],
      [330_000, 0.2],
      [800_000, 0.27],
      [4_300_000, 0.35],
      [Number.MAX_SAFE_INTEGER, 0.4],
    ],
    bagkurPremium: 9_036.91,
    // 2025 maktu damga vergisi toplamı (KDV + muhtasar/SGK + geçici + yıllık beyanname)
    annualStampTax: 11_632.27,
    // 2025: yurt dışı hizmet ihracatında %80 indirim
    serviceExportExemption: 0.8,
    // 49 No'lu Tebliğ 30.12.2025'te yayımlandı: 2025 kazançları için pratikte
    // YMM tasdik maliyetini varsayılan olarak hesaba katmıyoruz.
    ymmThreshold: null,
    defaults: {
      accountingCost: '3800',
      ymmCost: '0',
      currencyRates: {
        EUR: '45',
        USD: '40',
        GBP: '52',
      },
    },
  },
  2026: {
    // 2026 ücret dışı gelir vergisi tarifesi
    taxBrackets: [
      [190_000, 0.15],
      [400_000, 0.2],
      [1_000_000, 0.27],
      [5_300_000, 0.35],
      [Number.MAX_SAFE_INTEGER, 0.4],
    ],
    bagkurPremium: 11_808.23,
    /**
     * Yıllık toplam damga vergisi yükü (2026)
     *
     * 2026 maktu damga vergisi tutarları, yeniden değerleme oranı (%18,95) ile
     * artırılmış 2025 toplamına dayanılarak yaklaşık olarak hesaplanmıştır.
     * Beyanname türlerinin (KDV, geçici, muhtasar, yıllık) güncel maktu tutarları
     * için resmî GİB tarifesine bakılmalıdır.
     */
    annualStampTax: 13_836.11,
    // Cumhurbaşkanı Kararı 11257, 30.04.2026 RG: %80 → %100
    serviceExportExemption: 1.0,
    // 49 No'lu Tebliğ ile getirilen YMM tasdik raporu zorunluluk eşiği.
    ymmThreshold: 500_000,
    defaults: {
      accountingCost: '5000',
      ymmCost: '40000',
      currencyRates: {
        EUR: '53',
        USD: '35',
        GBP: '60',
      },
    },
  },
};

export const isTaxYear = (v: unknown): v is TaxYear =>
  typeof v === 'number' && TAX_YEARS.includes(v as TaxYear);
