interface RawFormDto {
  income: string;
  exchangeRate: string;
  accountingCosts: string;
  youngEntrepreneur: "yes" | "no";
}

export interface ValidatedForm {
  data: {
    income: number;
    exchangeRate: number;
    accountingCosts: number;
    youngEntrepreneur: boolean;
  };
  isValid: boolean;
  invalidFields: string[];
}

export const validate = (form: RawFormDto) => {
  const invalidFields: string[] = [];

  const data = {
    youngEntrepreneur: form.youngEntrepreneur === "yes",
  } as ValidatedForm["data"];

  ["income", "exchangeRate", "accountingCosts"].forEach((key) => {
    const value = toNumber(form[key]);
    if (value === null || value < 1) {
      invalidFields.push(key);
      return;
    }

    data[key] = value;
  });

  return {
    data,
    invalidFields,
    isValid: invalidFields.length === 0,
  };
};

const toNumber = (input: string) => {
  console.log(input);
  input = input.trim().replace(/(\.|,)$/, "");

  if (input === "") {
    return null;
  }

  return Number(input.replace(",", "."));
};
