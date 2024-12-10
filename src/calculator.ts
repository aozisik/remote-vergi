import { Dinero } from 'dinero.js';
import {
  BAGKUR_PREMIUM,
  SOFTWARE_SERVICE_EXPORT_EXEMPTION,
  ANNUAL_STAMP_TAX,
  YOUNG_ENTREPRENEUR_EXEMPTION,
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
    return [['Tüm alanların eksiksiz girildiğine emin olun.', '', null, null, 'before']];
  }

  const result = new Result();
  const incomeInTry = await convertEurToTry(toEur(data.income), data.exchangeRate);
  const annualIncomeTry = incomeInTry.multiply(12);

  // Expenses section
  let costsTotal = toTry(0);
  const addMonthlyCost = (name: string, amount: Dinero, url?: string) => {
    const annualCost = amount.multiply(12);
    costsTotal = costsTotal.add(annualCost);
    result.addLine(`${name} (${toText(amount)} / ay)`, annualCost, url, 'expenses');
  };

  addMonthlyCost('👨🏻‍💼 Muhasebe Giderleri', toTry(data.accountingCosts));
  addMonthlyCost(
    `📮 Damga Vergisi`,
    toTry(ANNUAL_STAMP_TAX).divide(12),
    'https://medium.com/mali-müşavir-evren-özmen/sahis-sirketi-giderleri-2024-85897c31e67e'
  );
  addMonthlyCost(
    '🩺 Bağkur Primi',
    toTry(data.youngEntrepreneur ? 0 : BAGKUR_PREMIUM)
  );
  result.addLine('Sabit Giderler', costsTotal, null, 'expenses', 'total');

  // Taxes and Income section
  const annualIncomeAfterCosts = annualIncomeTry.subtract(costsTotal);
  let totalTax = toTry(0);

  // Add income items under taxes group
  result.addLine('💰 Brüt Yıllık Gelir', annualIncomeTry, null, 'taxes');
  result.addLine(
    '💰 Vergilendirilebilir Gelir',
    annualIncomeAfterCosts,
    null,
    'taxes'
  );

  const exemptionAmount = annualIncomeAfterCosts.multiply(SOFTWARE_SERVICE_EXPORT_EXEMPTION);
  result.addLine(
    `🎁 Gelir Vergisi Muafiyeti (%${SOFTWARE_SERVICE_EXPORT_EXEMPTION * 100})`,
    exemptionAmount,
    'https://medium.com/mali-müşavir-evren-özmen/yurtdisi-yazilim-vergi-avantaji-80-5e8c4b1e5706',
    'taxes'
  );

  if (data.youngEntrepreneur) {
    result.addLine(
      '🎁 Genç Girişimci Muafiyeti',
      toTry(YOUNG_ENTREPRENEUR_EXEMPTION),
      'https://medium.com/türkiye/genç-girişimcilere-aralık-ayı-vergisel-hatırlatmalar-7b9d62e153fe',
      'taxes'
    );
  }

  let taxableIncome = data.youngEntrepreneur
    ? annualIncomeAfterCosts
      .subtract(toTry(YOUNG_ENTREPRENEUR_EXEMPTION))
      .multiply(1 - SOFTWARE_SERVICE_EXPORT_EXEMPTION)
    : annualIncomeAfterCosts.multiply(1 - SOFTWARE_SERVICE_EXPORT_EXEMPTION);

  if (taxableIncome.isNegative()) {
    taxableIncome = toTry(0);
  }

  const tax = incomeTax(taxableIncome);
  totalTax = tax;
  const taxRate = (tax.getAmount() / taxableIncome.getAmount()) * 100;

  result.addLine('🧾 Vergi matrahı', taxableIncome, null, 'taxes');
  result.addLine(`💸 Gelir vergisi (%${taxRate.toFixed(2)})`, tax, null, 'taxes');
  result.addLine('Vergiler', totalTax, null, 'taxes', 'total');

  // Final calculations (net income)
  const netAnnualIncome = annualIncomeTry.subtract(tax.add(costsTotal));
  result.addLine('Net Gelir', netAnnualIncome, null, 'income', 'total');
  result.addLine('💶 Net Yıllık Gelir', netAnnualIncome, null, 'income');
  result.addLine('💶 Net Aylık Gelir', netAnnualIncome.divide(12), null, 'income');
  result.addLine(
    '💶 Net Aylık Gelir (€)',
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
