import { Dinero } from "dinero.js";

import { toTry } from "./money";
import { TAX_BRACKETS } from "../constants";

export const incomeTax = (income: Dinero): Dinero => {
  let tax = toTry(0);

  for (let i = 0; i < TAX_BRACKETS.length; i++) {
    const [bracket, rate] = TAX_BRACKETS[i];
    const previousBracket = i === 0 ? 0 : TAX_BRACKETS[i - 1][0];

    const bracketAmount = toTry(bracket);
    const previousBracketAmount = toTry(previousBracket);

    const taxedAmount = bracketAmount.greaterThan(income)
      ? income.subtract(previousBracketAmount)
      : bracketAmount.subtract(previousBracketAmount);

    // console.log(`Apply %${rate * 100} for ${toText(taxedAmount)}`);

    tax = tax.add(taxedAmount.multiply(rate));

    if (bracketAmount.greaterThan(income)) {
      break;
    }
  }

  return tax;
};
