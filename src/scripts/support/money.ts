import Dinero from 'dinero.js';

export type ForeignCurrency = 'EUR' | 'USD' | 'GBP';

export const CURRENCY_SYMBOL: Record<ForeignCurrency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
};

export const toEur = (amount: number) =>
  Dinero({ amount: amount * 100, currency: 'EUR' });

export const toTry = (amount: number) =>
  Dinero({ amount: amount * 100, currency: 'TRY' });

export const toForeign = (amount: number, currency: ForeignCurrency) =>
  Dinero({ amount: amount * 100, currency });

export const convertEurToTry = (eur: Dinero.Dinero, exchangeRate: number) =>
  eur.convert('TRY', {
    endpoint: new Promise((resolve) =>
      resolve({
        rates: {
          TRY: exchangeRate,
        },
      }),
    ),
  });

export const convertForeignToTry = (
  amount: Dinero.Dinero,
  exchangeRate: number,
) =>
  amount.convert('TRY', {
    endpoint: new Promise((resolve) =>
      resolve({
        rates: {
          TRY: exchangeRate,
        },
      }),
    ),
  });

export const convertTryToEur = (tl: Dinero.Dinero, exchangeRate: number) =>
  tl.convert('EUR', {
    endpoint: new Promise((resolve) =>
      resolve({
        rates: {
          EUR: exchangeRate,
        },
      }),
    ),
  });

export const convertTryToForeign = (
  tl: Dinero.Dinero,
  exchangeRate: number,
  currency: ForeignCurrency,
) =>
  tl.convert(currency, {
    endpoint: new Promise((resolve) =>
      resolve({
        rates: {
          [currency]: exchangeRate,
        },
      }),
    ),
  });

export const toText = (money: Dinero.Dinero) =>
  money.setLocale('tr-TR').toFormat('$0,0.00');
