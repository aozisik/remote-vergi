import type Dinero from 'dinero.js';
import { toTry } from './money';

export const incomeTax = (
  income: Dinero.Dinero,
  brackets: [number, number][],
): Dinero.Dinero => {
  let tax = toTry(0);

  for (let i = 0; i < brackets.length; i++) {
    const [bracket, rate] = brackets[i];
    const previousBracket = i === 0 ? 0 : brackets[i - 1][0];

    const bracketAmount = toTry(bracket);
    const previousBracketAmount = toTry(previousBracket);

    const taxedAmount = bracketAmount.greaterThan(income)
      ? income.subtract(previousBracketAmount)
      : bracketAmount.subtract(previousBracketAmount);

    tax = tax.add(taxedAmount.multiply(rate));

    if (bracketAmount.greaterThan(income)) {
      break;
    }
  }

  return tax;
};
