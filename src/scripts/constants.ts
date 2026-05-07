// 2026 Değerleri
export const BAGKUR_PREMIUM = 11_808.23;

/**
 * Yıllık toplam damga vergisi yükü (2026)
 *
 * 2026 maktu damga vergisi tutarları, yeniden değerleme oranı (%18,95) ile
 * artırılmış 2025 toplamına dayanılarak yaklaşık olarak hesaplanmıştır.
 * Beyanname türlerinin (KDV, geçici, muhtasar, yıllık) güncel maktu tutarları
 * için resmî GİB tarifesine bakılmalıdır.
 */
export const ANNUAL_STAMP_TAX = 13_836.11;

// Yurt dışına verilen hizmetlerde kazanç indirimi
// (Cumhurbaşkanı Kararı 11257, 30.04.2026 tarihli RG ile %80 → %100)
export const SOFTWARE_SERVICE_EXPORT_EXEMPTION = 1.0;

// 49 No'lu Tebliğ ile getirilen YMM tasdik raporu zorunluluk eşiği.
// Yıllık indirim tutarı bu eşiği aşarsa YMM tasdik raporu zorunludur.
export const YMM_TASDIK_THRESHOLD = 500_000;

// 2026 Gelir Vergisi Dilimleri (Ücret Dışı Gelirler)
export const TAX_BRACKETS = [
  [190_000, 0.15],
  [400_000, 0.2],
  [1_000_000, 0.27],
  [5_300_000, 0.35],
  [Number.MAX_SAFE_INTEGER, 0.4],
];
