import { Dinero } from "dinero.js";
import {
  BAGKUR_PREMIUM,
  STAMP_TAX,
  YOUNG_ENTREPRENEUR_EXEMPTION,
} from "./constants";
import { Result, ResultLine } from "./result";
import { validate } from "./support/form";
import { incomeTax } from "./support/incomeTax";
import {
  convertEurToTry,
  convertTryToEur,
  toEur,
  toText,
  toTry,
} from "./support/money";

const calculate = async (form: any): Promise<ResultLine[]> => {
  const { isValid, data } = validate(form);

  if (!isValid) {
    return [["Tüm alanların eksiksiz girildiğine emin olun.", ""]];
  }

  const result = new Result();

  let costsTotal = toTry(0);
  const addMonthlyCost = (name: string, amount: Dinero) => {
    const annualCost = amount.multiply(12);
    costsTotal = costsTotal.add(annualCost);
    result.addLine(`${name} (${toText(amount)} / ay)`, annualCost);
  };

  result.addTitle("Sabit Giderler");
  addMonthlyCost("🗂️ Muhasebe Giderleri", toTry(data.accountingCosts));
  addMonthlyCost("📮 Damga Vergisi", toTry(STAMP_TAX));
  addMonthlyCost(
    "🩺 Bağkur Primi",
    toTry(data.youngEntrepreneur ? 0 : BAGKUR_PREMIUM)
  );

  // ----------------------------------------------------------------------------

  result.addTitle("Vergi");

  const incomeInTry = await convertEurToTry(
    toEur(data.income),
    data.exchangeRate
  );

  const annualIncomeTry = incomeInTry.multiply(12);
  result.addLine("🎁 Gelir Vergisi Muafiyeti (%50)", annualIncomeTry.divide(2));

  if (data.youngEntrepreneur) {
    result.addLine(
      "🎁 Genç Girişimci Muafiyeti",
      toTry(YOUNG_ENTREPRENEUR_EXEMPTION)
    );
  }

  let taxableIncome = data.youngEntrepreneur
    ? annualIncomeTry.divide(2).subtract(toTry(YOUNG_ENTREPRENEUR_EXEMPTION))
    : annualIncomeTry.divide(2);

  if (taxableIncome.isNegative()) {
    taxableIncome = toTry(0);
  }

  const tax = incomeTax(taxableIncome);
  const taxRate = (tax.getAmount() / taxableIncome.getAmount()) * 100;

  result.addLine("🧾 Vergi matrahı", taxableIncome);
  result.addLine(`💸 Gelir vergisi (%${taxRate.toFixed(2)})`, tax);

  // ----------------------------------------------------------------------------

  result.addTitle("Net Gelir Hesabı");

  const netAnnualIncome = annualIncomeTry.subtract(tax.add(costsTotal));

  result.addLine("💰 Brüt Yıllık Gelir", annualIncomeTry);
  result.addLine("💸 Yılık gider ve vergiler", tax.add(costsTotal));
  result.addLine("💶 Net Yıllık Gelir", netAnnualIncome);
  result.addLine("💶 Net Aylık Gelir", netAnnualIncome.divide(12));
  result.addLine(
    "💶 Net Aylık Gelir (€)",
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
