import { Dinero } from 'dinero.js';
import {
  BAGKUR_PREMIUM,
  SOFTWARE_SERVICE_EXPORT_EXEMPTION,
  ANNUAL_STAMP_TAX,
  YMM_TASDIK_THRESHOLD,
} from './constants';
import { Result, ResultLine } from './result';
import { validate } from './support/form';
import { incomeTax } from './support/incomeTax';
import {
  convertEurToTry,
  convertTryToEur,
  toEur,
  toText,
  toTry,
} from './support/money';

const calculate = async (form: any): Promise<ResultLine[]> => {
  const { isValid, data } = validate(form);

  if (!isValid) {
    return [
      [
        'Tüm alanların eksiksiz girildiğine emin olun.',
        '',
        null,
        null,
        'before',
      ],
    ];
  }

  const result = new Result();
  const incomeInTry = await convertEurToTry(
    toEur(data.income),
    data.exchangeRate
  );
  const annualIncomeTry = incomeInTry.multiply(12);

  // Expenses section
  let costsTotal = toTry(0);
  const addMonthlyCost = (name: string, amount: Dinero, url?: string) => {
    const annualCost = amount.multiply(12);
    costsTotal = costsTotal.add(annualCost);
    result.addLine(
      `${name} (${toText(amount)} / ay)`,
      annualCost,
      url,
      'expenses'
    );
  };
  const addAnnualCost = (name: string, amount: Dinero, url?: string) => {
    costsTotal = costsTotal.add(amount);
    result.addLine(name, amount, url, 'expenses');
  };

  addMonthlyCost('Muhasebe Giderleri', toTry(data.accountingCosts));
  addMonthlyCost('Damga Vergisi', toTry(ANNUAL_STAMP_TAX).divide(12));
  addMonthlyCost('Bağkur Primi', toTry(BAGKUR_PREMIUM));

  // YMM Tasdik Raporu — yıllık indirim tutarı eşiği aşarsa zorunlu.
  // Eşik kontrolü, YMM ücreti henüz eklenmeden önceki maliyetler üzerinden yapılır.
  const provisionalAfterCosts = annualIncomeTry.subtract(costsTotal);
  const provisionalExemption = provisionalAfterCosts.multiply(
    SOFTWARE_SERVICE_EXPORT_EXEMPTION
  );
  const ymmRequired = provisionalExemption.greaterThan(
    toTry(YMM_TASDIK_THRESHOLD)
  );
  if (ymmRequired && data.ymmCost > 0) {
    addAnnualCost(
      'YMM Tasdik Raporu (yıllık)',
      toTry(data.ymmCost),
      'https://www.alomaliye.com/2025/12/30/istisna-ve-indirimler-icin-ymm-tasdik-raporu-zorunlulugu/'
    );
  }

  result.addLine('Sabit Giderler', costsTotal, null, 'expenses', 'total');

  // Taxes and Income section
  const annualIncomeAfterCosts = annualIncomeTry.subtract(costsTotal);
  let totalTax = toTry(0);

  result.addLine('Brüt Yıllık Gelir', annualIncomeTry, null, 'taxes');
  result.addLine(
    'Vergilendirilebilir Gelir',
    annualIncomeAfterCosts,
    null,
    'taxes'
  );

  const exemptionAmount = annualIncomeAfterCosts.multiply(
    SOFTWARE_SERVICE_EXPORT_EXEMPTION
  );
  result.addLine(
    `Hizmet İhracatı İstisnası (%${SOFTWARE_SERVICE_EXPORT_EXEMPTION * 100})`,
    exemptionAmount,
    'https://www.alomaliye.com/2026/01/27/yurtdisi-hizmet-ihraci-istisnasinda-yeni-donem/',
    'taxes'
  );

  let taxableIncome = annualIncomeAfterCosts.multiply(
    1 - SOFTWARE_SERVICE_EXPORT_EXEMPTION
  );

  if (taxableIncome.isNegative()) {
    taxableIncome = toTry(0);
  }

  const tax = incomeTax(taxableIncome);
  totalTax = tax;
  const taxRate =
    taxableIncome.getAmount() === 0
      ? 0
      : (tax.getAmount() / taxableIncome.getAmount()) * 100;

  result.addLine('Vergi Matrahı', taxableIncome, null, 'taxes');
  result.addLine(
    `Gelir Vergisi (%${taxRate.toFixed(2)})`,
    tax,
    null,
    'taxes'
  );
  result.addLine('Vergiler', totalTax, null, 'taxes', 'total');

  // Final calculations (net income)
  const netAnnualIncome = annualIncomeTry.subtract(tax.add(costsTotal));
  result.addLine('Net Gelir', netAnnualIncome, null, 'income', 'total');
  result.addLine('Net Yıllık Gelir', netAnnualIncome, null, 'income');
  result.addLine(
    'Net Aylık Gelir',
    netAnnualIncome.divide(12),
    null,
    'income'
  );
  result.addLine(
    'Net Aylık Gelir (€)',
    await convertTryToEur(netAnnualIncome.divide(12), 1 / data.exchangeRate),
    null,
    'income'
  );

  return result.getLines();
};

declare global {
  interface Window {
    calculate: any;
  }
}

window.calculate = calculate;
