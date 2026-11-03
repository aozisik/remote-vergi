// Tax calendar for a remote şahıs şirketi owner, generated from the deadline
// rules in GİB's "Beyanname Verme ve Ödeme Süreleri" table (15.01.2026).
//
// A deadline that falls on a weekend or an official holiday moves to the next
// business day (VUK md. 18 and GİB practice). Dates after OFFICIAL_THROUGH are
// marked `estimated` until GİB publishes that year's calendar: when it does,
// check the generated dates against it and move OFFICIAL_THROUGH forward.
//
// Sources:
// - GİB, Beyanname Verme ve Ödeme Süreleri:
//   https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv%2Fyardim-kaynaklar%2Fyararli-bilgiler%2FBeyannameVermeveOdemeSureleri.pdf
// - 7566 sayılı Kanun (RG 19.12.2025): 4. dönem geçici vergi 2025'ten itibaren geri geldi.
// - 5510 md. 88: 4/b primleri izleyen ayda Kurumca belirlenen günün sonuna kadar ödenir.

export const OFFICIAL_THROUGH = '2026-12-31';
const RANGE_START = '2026-11-01';
const RANGE_END = '2027-12-31';

export type DeadlineKind =
  | 'kdv'
  | 'gecici'
  | 'yillik'
  | 'taksit'
  | 'bagkur'
  | 'muhtasar'
  | 'ymm';

// Who sees an entry. 'herkes' entries are always shown; the others are
// opt-in toggles on the page and separate .ics feeds.
export type Audience = 'herkes' | 'stopaj' | 'ymm';

export interface Deadline {
  id: string;
  date: string; // YYYY-MM-DD, after any weekend/holiday shift
  originalDate?: string; // set when the date was shifted
  kind: DeadlineKind;
  audience: Audience;
  title: string;
  period: string;
  body: string;
  guide?: { href: string; label: string };
  estimated: boolean;
}

// Full-day official holidays (Ramazan and Kurban per Diyanet). Half-day
// arife afternoons do not move deadlines, so they are not listed.
const HOLIDAYS = new Set([
  '2026-01-01', '2026-03-20', '2026-03-21', '2026-03-22', '2026-04-23',
  '2026-05-01', '2026-05-19', '2026-05-27', '2026-05-28', '2026-05-29',
  '2026-05-30', '2026-07-15', '2026-08-30', '2026-10-29',
  '2027-01-01', '2027-03-09', '2027-03-10', '2027-03-11', '2027-04-23',
  '2027-05-01', '2027-05-16', '2027-05-17', '2027-05-18', '2027-05-19',
  '2027-07-15', '2027-08-30', '2027-10-29',
]);

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const iso = (y: number, m: number, d: number): string =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const lastDay = (y: number, m: number): number =>
  new Date(Date.UTC(y, m, 0)).getUTCDate();

// Move a date forward to the next business day.
const toBusinessDay = (date: string): string => {
  const d = new Date(`${date}T00:00:00Z`);
  for (;;) {
    const day = d.getUTCDay();
    const key = d.toISOString().slice(0, 10);
    if (day !== 0 && day !== 6 && !HOLIDAYS.has(key)) return key;
    d.setUTCDate(d.getUTCDate() + 1);
  }
};

const make = (
  raw: string,
  entry: Omit<Deadline, 'date' | 'originalDate' | 'estimated'>
): Deadline => {
  const date = toBusinessDay(raw);
  return {
    ...entry,
    date,
    ...(date !== raw ? { originalDate: raw } : {}),
    estimated: date > OFFICIAL_THROUGH,
  };
};

const build = (): Deadline[] => {
  const out: Deadline[] = [];

  // Monthly obligations for each period month, due the following month.
  for (let y = 2026; y <= 2027; y++) {
    for (let m = 1; m <= 12; m++) {
      const ny = m === 12 ? y + 1 : y;
      const nm = m === 12 ? 1 : m + 1;
      const period = `${MONTHS[m - 1]} ${y}`;

      out.push(
        make(iso(ny, nm, 28), {
          id: `kdv-${y}-${m}`,
          kind: 'kdv',
          audience: 'herkes',
          title: 'KDV beyannamesi',
          period,
          body: 'Hizmet ihracatı faturaların 302 koduyla istisna olarak gösterilir. KDV çıkmasa da beyanname her ay verilir.',
          guide: { href: '/302-11-1-a-fatura-ornegi/', label: '302 kodu nedir' },
        })
      );

      out.push(
        make(iso(ny, nm, 26), {
          id: `muhtasar-${y}-${m}`,
          kind: 'muhtasar',
          audience: 'stopaj',
          title: 'Muhtasar ve prim hizmet beyannamesi',
          period,
          body: 'Çalışanının ücretinden ya da ödediğin kiradan kestiğin stopajı bildirir ve ödersin. Bazı mükellefler üç ayda bir verebilir; mali müşavirine sor.',
        })
      );

      out.push(
        make(iso(ny, nm, lastDay(ny, nm)), {
          id: `bagkur-${y}-${m}`,
          kind: 'bagkur',
          audience: 'herkes',
          title: 'Bağ-Kur primi ödemesi',
          period,
          body: 'Bir önceki ayın 4/b primi. Zamanında ödersen ve geçmiş borcun yoksa 5 puanlık indirimden yararlanabilirsin. Kesin tarihi e-Devlet\'ten kontrol et.',
          guide: { href: '/sahis-sirketi-maliyet/', label: 'Bağ-Kur ne kadar' },
        })
      );
    }
  }

  // Quarterly geçici vergi: 17th of the second month after each quarter.
  const quarters: Array<[number, number, number, string]> = [
    [5, 0, 1, 'Ocak – Mart'],
    [8, 0, 2, 'Nisan – Haziran'],
    [11, 0, 3, 'Temmuz – Eylül'],
    [2, 1, 4, 'Ekim – Aralık'],
  ];
  for (let y = 2026; y <= 2027; y++) {
    for (const [month, yearOffset, q, label] of quarters) {
      out.push(
        make(iso(y + yearOffset, month, 17), {
          id: `gecici-${y}-${q}`,
          kind: 'gecici',
          audience: 'herkes',
          title: `Geçici vergi, ${q}. dönem`,
          period: `${label} ${y}`,
          body:
            q === 4
              ? '7566 sayılı Kanun ile geri gelen 4. dönem. Kazancı bu tarihe kadar Türkiye\'ye getirdiysen hizmet ihracatı indirimini bu dönemde de uygulayabilirsin.'
              : 'Üç aylık kazancın üzerinden peşin vergi. Kazancı bu tarihe kadar Türkiye\'ye getirdiysen hizmet ihracatı indirimini bu dönemde de uygulayabilirsin.',
          guide: { href: '/sozluk/#gecici-vergi', label: 'Geçici vergi nedir' },
        })
      );
    }
  }

  // Annual return (for the previous year) and its two installments.
  for (const y of [2027]) {
    out.push(
      make(iso(y, 3, 31), {
        id: `yillik-${y}`,
        kind: 'yillik',
        audience: 'herkes',
        title: 'Yıllık gelir vergisi beyannamesi ve 1. taksit',
        period: `${y - 1} kazancı`,
        body: 'Mart ayı boyunca verilir. %100 hizmet ihracatı indirimi burada uygulanır. Kazancın tamamı bu tarihe kadar Türkiye\'de olmalı.',
        guide: { href: '/hizmet-ihracati-istisnasi/', label: 'İndirimin şartları' },
      })
    );
    out.push(
      make(iso(y, 7, 31), {
        id: `taksit-${y}`,
        kind: 'taksit',
        audience: 'herkes',
        title: 'Gelir vergisi 2. taksit',
        period: `${y - 1} kazancı`,
        body: 'Yıllık beyannamede çıkan verginin ikinci yarısı. İndirim kazancının tamamını kapsıyorsa ödenecek tutar olmayabilir.',
      })
    );
    out.push(
      make(iso(y, 5, 31), {
        id: `ymm-${y}`,
        kind: 'ymm',
        audience: 'ymm',
        title: 'YMM tasdik raporunun teslimi',
        period: `${y - 1} kazancı`,
        body: 'Yıllık indirim tutarın eşiği geçtiyse, beyanname süresinin bitiminden itibaren 2 ay içinde. Kaçırırsan indirim düşer ve ceza kesilir.',
        guide: { href: '/ymm-tasdik-ucreti/', label: 'YMM ücretleri' },
      })
    );
  }

  return out
    .filter((d) => d.date >= RANGE_START && d.date <= RANGE_END)
    .sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind));
};

export const deadlines: Deadline[] = build();

// Refuse to build a calendar that is about to run out of dates.
const lastDate = deadlines[deadlines.length - 1]?.date;
const daysLeft = lastDate
  ? (Date.parse(lastDate) - Date.now()) / 86_400_000
  : 0;
if (daysLeft < 45) {
  throw new Error(
    `Vergi takvimi ${lastDate} tarihinde bitiyor (${Math.floor(daysLeft)} gün kaldı). src/data/takvim.ts içine yeni yılı ekle.`
  );
}

export type Variant = 'temel' | 'stopaj' | 'ymm' | 'tam';

export const variants: Record<Variant, { label: string; audiences: Audience[] }> = {
  temel: { label: 'Temel', audiences: ['herkes'] },
  stopaj: { label: 'Stopaj dahil', audiences: ['herkes', 'stopaj'] },
  ymm: { label: 'YMM dahil', audiences: ['herkes', 'ymm'] },
  tam: { label: 'Hepsi', audiences: ['herkes', 'stopaj', 'ymm'] },
};

export const deadlinesFor = (variant: Variant): Deadline[] =>
  deadlines.filter((d) => variants[variant].audiences.includes(d.audience));

export const formatDate = (date: string, opts: Intl.DateTimeFormatOptions = {}) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    ...opts,
  });
