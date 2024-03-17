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
    return [['Tüm alanların eksiksiz girildiğine emin olun.', '']];
  }

  const result = new Result();

  let costsTotal = toTry(0);
  const addMonthlyCost = (name: string, amount: Dinero, url?: string) => {
    const annualCost = amount.multiply(12);
    costsTotal = costsTotal.add(annualCost);
    result.addLine(`${name} (${toText(amount)} / ay)`, annualCost, url);
  };

  result.addTitle('Sabit Giderler');
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

  result.addLine('➖ Toplam yıllık sabit gider', costsTotal);

  // ----------------------------------------------------------------------------

  result.addTitle('Vergi');

  const incomeInTry = await convertEurToTry(
    toEur(data.income),
    data.exchangeRate
  );

  const annualIncomeTry = incomeInTry.multiply(12);
  const annualIncomeAfterCosts = annualIncomeTry.subtract(costsTotal);

  result.addLine(
    '💰 Yıllık Gelir (aylık gelir x 12) - sabit giderler',
    annualIncomeAfterCosts
  );

  result.addLine(
    `🎁 Gelir Vergisi Muafiyeti (%${SOFTWARE_SERVICE_EXPORT_EXEMPTION * 100})`,
    annualIncomeAfterCosts.multiply(SOFTWARE_SERVICE_EXPORT_EXEMPTION),
    'https://medium.com/mali-müşavir-evren-özmen/yurtdisi-yazilim-vergi-avantaji-80-5e8c4b1e5706'
  );

  if (data.youngEntrepreneur) {
    result.addLine(
      '🎁 Genç Girişimci Muafiyeti',
      toTry(YOUNG_ENTREPRENEUR_EXEMPTION),
      'https://medium.com/türkiye/genç-girişimcilere-aralık-ayı-vergisel-hatırlatmalar-7b9d62e153fe'
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
  const taxRate = (tax.getAmount() / taxableIncome.getAmount()) * 100;

  result.addLine('🧾 Vergi matrahı', taxableIncome);
  result.addLine(`💸 Gelir vergisi (%${taxRate.toFixed(2)})`, tax);

  // ----------------------------------------------------------------------------

  result.addTitle('Net Gelir Hesabı');

  const netAnnualIncome = annualIncomeTry.subtract(tax.add(costsTotal));

  result.addLine('💰 Brüt Yıllık Gelir', annualIncomeTry);
  result.addLine('💸 Yılık gider ve vergiler', tax.add(costsTotal));
  result.addLine('💶 Net Yıllık Gelir', netAnnualIncome);
  result.addLine('💶 Net Aylık Gelir', netAnnualIncome.divide(12));
  result.addLine(
    '💶 Net Aylık Gelir (€)',
    await convertTryToEur(netAnnualIncome.divide(12), 1 / data.exchangeRate)
  );

  return result.getLines();
};

declare global {
  interface Window {
    calculate: any;
  }
}

window.calculate = calculate;
