import { Dinero } from "dinero.js";
import {
  BAGKUR_PREMIUM,
  STAMP_TAX,
  YEAR,
  YOUNG_ENTREPRENEUR_EXEMPTION,
} from "./constants";
import { validate } from "./support/form";
import { incomeTax } from "./support/incomeTax";
import { convertEurToTry, toEur, toText, toTry } from "./support/money";

type ResultLine = [string, string];

const calculate = async (form: any): Promise<ResultLine[]> => {
  const { isValid, data } = validate(form);

  if (!isValid) {
    return [["Tüm alanların eksiksiz girildiğine emin olun.", ""]];
  }

  const lines: ResultLine[] = [];

  const incomeInTry = await convertEurToTry(
    toEur(data.income),
    data.exchangeRate
  );

  const annualIncomeTry = incomeInTry.multiply(12);

  lines.push(["Brüt Gelir", ""]);
  lines.push(["💰 Aylık Gelir", toText(incomeInTry)]);
  lines.push(["💰 Yıllık Gelir", toText(annualIncomeTry)]);

  let costsTotal = toTry(0);

  const addMonthlyCost = (name: string, amount: Dinero) => {
    const annualCost = amount.multiply(12);
    costsTotal = costsTotal.add(annualCost);
    lines.push([`${name} (${toText(amount)} / ay)`, toText(annualCost)]);
  };

  lines.push(["Sabit Giderler", ""]);

  addMonthlyCost("🗂️ Muhasebe Giderleri", toTry(data.accountingCosts));
  addMonthlyCost("📮 Damga Vergisi", toTry(STAMP_TAX));

  addMonthlyCost(
    "🩺 Bağkur Primi",
    toTry(data.youngEntrepreneur ? 0 : BAGKUR_PREMIUM)
  );

  lines.push(["Vergi", ""]);

  lines.push([
    "🎁 Gelir Vergisi Muafiyeti (%50)",
    toText(annualIncomeTry.divide(2)),
  ]);

  if (data.youngEntrepreneur) {
    lines.push([
      "🎁 Genç Girişimci Muafiyeti",
      toText(toTry(YOUNG_ENTREPRENEUR_EXEMPTION)),
    ]);
  }

  const taxableIncome = data.youngEntrepreneur
    ? annualIncomeTry.divide(2).subtract(toTry(YOUNG_ENTREPRENEUR_EXEMPTION))
    : annualIncomeTry.divide(2);

  const tax = incomeTax(taxableIncome);
  const taxRate = Number(
    (tax.getAmount() / taxableIncome.getAmount()) * 100
  ).toFixed(2);

  const netAnnualIncome = annualIncomeTry.subtract(tax.add(costsTotal));

  lines.push(["🧾 Vergi matrahı", toText(taxableIncome)]);
  lines.push([`💸 Gelir vergisi (%${taxRate})`, toText(tax)]);

  lines.push(["Net Gelir", ""]);
  lines.push(["💰 Sabit gider ve vergiler", toText(tax.add(costsTotal))]);
  lines.push(["💰 Yıllık Gelir", toText(netAnnualIncome)]);
  lines.push(["💰 Aylık Gelir", toText(netAnnualIncome.divide(12))]);
  lines.push([
    "💰 Aylık Net Gelir (€)",
    toText(
      toEur(
        netAnnualIncome.divide(12).divide(data.exchangeRate).getAmount() / 100
      )
    ),
  ]);

  return lines;
};

declare global {
  interface Window {
    calculate: any;
  }
}

window.calculate = calculate;
