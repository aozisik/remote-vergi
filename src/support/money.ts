import Dinero from "dinero.js";

export const toEur = (amount: number) =>
  Dinero({ amount: amount * 100, currency: "EUR" });

export const toTry = (amount: number) =>
  Dinero({ amount: amount * 100, currency: "TRY" });

export const convertEurToTry = (eur: Dinero.Dinero, exchangeRate: number) =>
  eur.convert("TRY", {
    endpoint: new Promise((resolve) =>
      resolve({
        rates: {
          TRY: exchangeRate,
        },
      })
    ),
  });

export const convertTryToEur = (tl: Dinero.Dinero, exchangeRate: number) =>
  tl.convert("EUR", {
    endpoint: new Promise((resolve) =>
      resolve({
        rates: {
          EUR: exchangeRate,
        },
      })
    ),
  });
export const toText = (money: Dinero.Dinero) =>
  money.setLocale("tr-TR").toFormat("$0,0.00");
