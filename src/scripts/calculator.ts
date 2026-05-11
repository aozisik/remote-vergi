import type Dinero from 'dinero.js';
import {
  CONSTANTS_BY_YEAR,
  DEFAULT_TAX_YEAR,
  isTaxYear,
  type TaxYear,
} from './constants';
import type { ResultLine } from './result';
import { Result } from './result';
import { incomeTax } from './support/incomeTax';
import {
  CURRENCY_SYMBOL,
  type ForeignCurrency,
  convertForeignToTry,
  convertTryToForeign,
  toForeign,
  toText,
  toTry,
} from './support/money';

interface MixedForm {
  yurtDisiIncome: string;
  yurtIciIncome: string;
  exchangeRate: string;
  accountingCosts: string;
  bagkurPremium: string;
  ymmCost: string;
  currency?: string;
  taxYear?: string | number;
}

const isForeignCurrency = (v: unknown): v is ForeignCurrency =>
  v === 'EUR' || v === 'USD' || v === 'GBP';

const num = (v: string | undefined, fallback = 0): number => {
  if (!v) return fallback;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
};

const resolveTaxYear = (v: unknown): TaxYear => {
  const n = typeof v === 'string' ? Number(v) : v;
  return isTaxYear(n) ? n : DEFAULT_TAX_YEAR;
};

export const calculate = async (form: MixedForm): Promise<ResultLine[]> => {
  const yurtDisiMonthly = num(form.yurtDisiIncome);
  const yurtIciMonthly = num(form.yurtIciIncome);
  const exchangeRate = num(form.exchangeRate);
  const accountingCostsMonthly = num(form.accountingCosts);
  const ymmCost = num(form.ymmCost);
  const currency: ForeignCurrency = isForeignCurrency(form.currency)
    ? form.currency
    : 'EUR';
  const symbol = CURRENCY_SYMBOL[currency];
  const taxYear = resolveTaxYear(form.taxYear);
  const yc = CONSTANTS_BY_YEAR[taxYear];
  const bagkurMonthly = num(form.bagkurPremium, yc.bagkurPremium);

  if (
    yurtDisiMonthly < 0 ||
    yurtIciMonthly < 0 ||
    exchangeRate < 1 ||
    accountingCostsMonthly < 0 ||
    bagkurMonthly < 0 ||
    yurtDisiMonthly + yurtIciMonthly === 0
  ) {
    return [
      [
        'Geliri ve kuru eksiksiz girin (yurt dışı ve yurt içi toplamı 0 olamaz).',
        '',
        null,
        null,
        'before',
      ],
    ];
  }

  const result = new Result();

  // Annualize income streams (everything is in TL).
  const yurtDisiAnnualTry = (
    await convertForeignToTry(toForeign(yurtDisiMonthly, currency), exchangeRate)
  ).multiply(12);
  const yurtIciAnnualTry = toTry(yurtIciMonthly).multiply(12);
  const totalAnnualTry = yurtDisiAnnualTry.add(yurtIciAnnualTry);

  // Expenses
  let costsTotal = toTry(0);
  const addMonthlyCost = (
    name: string,
    amount: Dinero.Dinero,
    url?: string,
  ) => {
    const annualCost = amount.multiply(12);
    costsTotal = costsTotal.add(annualCost);
    result.addLine(
      `${name} (${toText(amount)} / ay)`,
      annualCost,
      url,
      'expenses',
    );
  };
  const addAnnualCost = (name: string, amount: Dinero.Dinero, url?: string) => {
    costsTotal = costsTotal.add(amount);
    result.addLine(name, amount, url, 'expenses');
  };

  addMonthlyCost('Muhasebe Giderleri', toTry(accountingCostsMonthly));
  addMonthlyCost('Damga Vergisi', toTry(yc.annualStampTax).divide(12));
  addMonthlyCost('Bağkur Primi', toTry(bagkurMonthly));

  // YMM zorunluluğu yalnızca yurt dışı (istisna) kazancı üzerinden tetiklenir.
  // Eşik kontrolü maliyetler eklenmeden önce, yurt dışı brüt kâr üzerinden yapılır.
  const yurtDisiCostShareRatio =
    totalAnnualTry.getAmount() === 0
      ? 0
      : yurtDisiAnnualTry.getAmount() / totalAnnualTry.getAmount();
  const yurtDisiPreTaxNet = yurtDisiAnnualTry.subtract(
    costsTotal.multiply(yurtDisiCostShareRatio),
  );
  const provisionalIstisna = yurtDisiPreTaxNet.multiply(
    yc.serviceExportExemption,
  );
  const ymmRequired =
    yc.ymmThreshold !== null &&
    provisionalIstisna.greaterThan(toTry(yc.ymmThreshold));
  if (ymmRequired && ymmCost > 0) {
    addAnnualCost(
      'YMM Tasdik Raporu (yıllık)',
      toTry(ymmCost),
      'https://www.alomaliye.com/2025/12/30/istisna-ve-indirimler-icin-ymm-tasdik-raporu-zorunlulugu/',
    );
  }

  result.addLine('Sabit Giderler', costsTotal, null, 'expenses', 'total');

  // Pro-rata cost allocation (after YMM is added if applicable).
  const ratio =
    totalAnnualTry.getAmount() === 0
      ? 0
      : yurtDisiAnnualTry.getAmount() / totalAnnualTry.getAmount();
  const yurtDisiCosts = costsTotal.multiply(ratio);
  const yurtIciCosts = costsTotal.subtract(yurtDisiCosts);

  const yurtDisiKarBeforeExemption = yurtDisiAnnualTry.subtract(yurtDisiCosts);
  const yurtIciKar = yurtIciAnnualTry.subtract(yurtIciCosts);

  // Tax section
  const hasYurtIci = yurtIciAnnualTry.getAmount() > 0;
  result.addLine(
    hasYurtIci ? 'Brüt Yurt Dışı Kazanç' : 'Brüt Yıllık Gelir',
    yurtDisiAnnualTry,
    null,
    'taxes',
  );
  if (hasYurtIci) {
    result.addLine('Brüt Yurt İçi Kazanç', yurtIciAnnualTry, null, 'taxes');
  }
  const istisnaTutari = yurtDisiKarBeforeExemption.isPositive()
    ? yurtDisiKarBeforeExemption.multiply(yc.serviceExportExemption)
    : toTry(0);
  const yurtDisiVergiyeTabi = yurtDisiKarBeforeExemption.isPositive()
    ? yurtDisiKarBeforeExemption.subtract(istisnaTutari)
    : toTry(0);
  result.addLine(
    `Hizmet İhracatı İstisnası (%${yc.serviceExportExemption * 100})`,
    istisnaTutari,
    'https://www.alomaliye.com/2026/01/27/yurtdisi-hizmet-ihraci-istisnasinda-yeni-donem/',
    'taxes',
  );

  let taxableIncome = yurtIciKar.add(yurtDisiVergiyeTabi);
  if (taxableIncome.isNegative()) taxableIncome = toTry(0);

  const tax = incomeTax(taxableIncome, yc.taxBrackets);
  const taxRate =
    taxableIncome.getAmount() === 0
      ? 0
      : (tax.getAmount() / taxableIncome.getAmount()) * 100;

  result.addLine(
    hasYurtIci ? 'Vergi Matrahı (Yurt İçi)' : 'Vergi Matrahı',
    taxableIncome,
    null,
    'taxes',
  );
  result.addLine(`Gelir Vergisi (%${taxRate.toFixed(2)})`, tax, null, 'taxes');
  result.addLine('Vergiler', tax, null, 'taxes', 'total');

  // Net income
  const netAnnual = totalAnnualTry.subtract(tax.add(costsTotal));
  result.addLine('Net Gelir', netAnnual, null, 'income', 'total');
  result.addLine('Net Yıllık Gelir', netAnnual, null, 'income');
  result.addLine('Net Aylık Gelir', netAnnual.divide(12), null, 'income');
  result.addLine(
    `Net Aylık Gelir (${symbol})`,
    await convertTryToForeign(netAnnual.divide(12), 1 / exchangeRate, currency),
    null,
    'income',
  );

  return result.getLines();
};
