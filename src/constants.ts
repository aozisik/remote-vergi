// 2025 Değerleri
export const BAGKUR_PREMIUM = 7671.38;

// Genç girişimci istisnası
export const YOUNG_ENTREPRENEUR_EXEMPTION = 330_000;

/**
 * Yıllık toplam damga vergisi yükü
 *
 * KDV Beyannamesi Damga Vergisi:
 * Ödeme sıklığı: Her ay
 * Tutar: 443,74 TL × 12 ay = 5.324,88 TL/yıl
 *
 * Gelir Geçici Beyannamesi Damga Vergisi:
 * Ödeme sıklığı: 3 ayda bir (Mart, Haziran, Eylül, Aralık)
 * Tutar: 691,15 TL × 4 dönem = 2.764,60 TL/yıl
 *
 * Muhtasar Beyannamesi Damga Vergisi:
 * Ödeme sıklığı: 3 ayda bir
 * Tutar: 526,06 TL × 4 dönem = 2.104,24 TL/yıl
 * Yıllık Gelir Vergisi Beyannamesi Damga Vergisi:
 *
 * Ödeme sıklığı: Yılda bir kez (Mart ayında)
 * Tutar: 1.438,15 TL/yıl
 *
 * Toplam Yıllık Damga Vergisi: 11.631,87 TL
 */
export const ANNUAL_STAMP_TAX = 11_631.87;

// Yazılım hizmeti ihracatı istisnası
export const SOFTWARE_SERVICE_EXPORT_EXEMPTION = 0.8;

// Vergi dilimleri
export const TAX_BRACKETS = [
  [158_000, 0.15],
  [330_000, 0.2],
  [800_000, 0.27],
  [4_300_000, 0.35],
  [Number.MAX_SAFE_INTEGER, 0.4],
];
