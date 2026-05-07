interface RawFormDto {
  income: string;
  exchangeRate: string;
  accountingCosts: string;
  ymmCost: string;
}

export interface ValidatedForm {
  data: {
    income: number;
    exchangeRate: number;
    accountingCosts: number;
    ymmCost: number;
  };
  isValid: boolean;
}

export const validate = (form: RawFormDto) => {
  const invalidFields: string[] = [];

  const data = {} as ValidatedForm['data'];

  ['income', 'exchangeRate', 'accountingCosts'].forEach((key) => {
    const value = toNumber(form[key]);
    if (value === null || value < 1) {
      invalidFields.push(key);
      return;
    }

    data[key] = value;
  });

  const ymm = toNumber(form.ymmCost);
  data.ymmCost = ymm === null || ymm < 0 ? 0 : ymm;

  return {
    data,
    isValid: invalidFields.length === 0,
  };
};

const toNumber = (input: string) => {
  input = (input ?? '').trim().replace(/(\.|,)$/, '');

  if (input === '') {
    return null;
  }

  return Number(input.replace(',', '.'));
};
