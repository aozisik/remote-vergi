// The figures the site quotes, in one place. Anything the calculator also uses
// is read from its constants so prose and calculator can never disagree.
// When a figure changes (new year, new Bağ-Kur base), update it here and every
// page that renders <Fact name="..."/> follows.

import { CONSTANTS_BY_YEAR } from '../scripts/constants';

const y2026 = CONSTANTS_BY_YEAR[2026];

export interface FactEntry {
  value: number;
  unit: 'tl' | 'pct' | 'count';
  label: string;
  source?: { label: string; url: string };
}

export const facts = {
  hizmetIhracatiIndirimi: {
    value: y2026.serviceExportExemption * 100,
    unit: 'pct',
    label: 'Hizmet ihracatı kazanç indirimi oranı (2026)',
    source: {
      label: '11257 sayılı Cumhurbaşkanı Kararı, 30.04.2026 RG',
      url: 'https://www.resmigazete.gov.tr/',
    },
  },
  ymmIndirimEsigi: {
    value: y2026.ymmThreshold ?? 0,
    unit: 'tl',
    label: 'YMM tasdik zorunluluğu: yıllık indirim tutarı eşiği',
    source: {
      label: "49 No'lu Gelir Vergisi Genel Tebliği",
      url: 'https://www.alomaliye.com/2025/12/30/istisna-ve-indirimler-icin-ymm-tasdik-raporu-zorunlulugu/',
    },
  },
  ymmToplamEsik: {
    value: 1_000_000,
    unit: 'tl',
    label: 'YMM tasdik zorunluluğu: toplam istisna ve indirim eşiği',
    source: {
      label: "49 No'lu Gelir Vergisi Genel Tebliği",
      url: 'https://www.alomaliye.com/2025/12/30/istisna-ve-indirimler-icin-ymm-tasdik-raporu-zorunlulugu/',
    },
  },
  ymmCezaAsgari: {
    value: 400_000,
    unit: 'tl',
    label: 'YMM raporu süresinde verilmezse asgari özel usulsüzlük cezası',
  },
  bagkurAsgariAylik: {
    value: Math.round(y2026.bagkurPremium),
    unit: 'tl',
    label: 'Bağ-Kur (4-B) asgari aylık prim (2026)',
    source: { label: 'SGK', url: 'https://www.sgk.gov.tr' },
  },
  damgaVergisiYillik: {
    value: Math.round(y2026.annualStampTax),
    unit: 'tl',
    label: 'Beyannamelerin yıllık toplam damga vergisi (2026, yaklaşık)',
  },
  smmmAsgariAylik: {
    value: 4_492,
    unit: 'tl',
    label: 'TÜRMOB asgari aylık mali müşavir ücreti (2026)',
  },
  gencGirisimciIstisnasi: {
    value: 400_000,
    unit: 'tl',
    label: 'Genç girişimci kazanç istisnası, yıllık (2026)',
  },
  uygulamaOzelHesapLimiti: {
    value: 5_300_000,
    unit: 'tl',
    label: 'Mobil uygulama özel hesap istisnası yıllık hasılat sınırı (2026)',
  },
  uygulamaOzelHesapStopaji: {
    value: 15,
    unit: 'pct',
    label: 'Mobil uygulama özel hesap stopaj oranı',
  },
  gelirVergisiEnDusukDilim: {
    value: y2026.taxBrackets[0][1] * 100,
    unit: 'pct',
    label: 'Gelir vergisi en düşük dilim oranı',
  },
  gelirVergisiEnYuksekDilim: {
    value: y2026.taxBrackets[y2026.taxBrackets.length - 1][1] * 100,
    unit: 'pct',
    label: 'Gelir vergisi en yüksek dilim oranı',
  },
} satisfies Record<string, FactEntry>;

export type FactName = keyof typeof facts;

const tl = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

export const formatFact = (name: FactName): string => {
  const f: FactEntry = facts[name];
  if (f.unit === 'tl') return `${tl.format(f.value)} ₺`;
  if (f.unit === 'pct') return `%${tl.format(f.value)}`;
  return tl.format(f.value);
};

// The 2026 tariff, formatted for display.
export const taxBrackets2026 = y2026.taxBrackets.map(([limit, rate], i, all) => {
  const from = i === 0 ? 0 : all[i - 1][0];
  return {
    range:
      limit === Number.MAX_SAFE_INTEGER
        ? `${tl.format(from)} ₺ üzeri`
        : `${tl.format(from)} – ${tl.format(limit)} ₺`,
    rate: `%${Math.round(rate * 100)}`,
  };
});
