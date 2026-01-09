export type Option = {
  id: string;
  label: string;
  params?: Record<string, unknown>;
  priceDelta: number;
};

export type Module = {
  id: string;
  name: string;
  type: "select";
  options: Option[];
};

export type Model = {
  id: string;
  name: string;
  basePrice: number;
  modules: string[];
  leadTime?: string;
};

export type Catalog = {
  models: Model[];
  modules: Module[];
};

export type Rule =
  | {
      id: string;
      type: "requires";
      if: { module: string; option: string };
      then: { module: string; option?: string; notOption?: string; optionIn?: string[] };
      message: string;
    }
  | {
      id: string;
      type: "forbid";
      if: { module: string; option: string };
      then: { module: string; option?: string; notOption?: string; optionIn?: string[] };
      message: string;
    };

export type Ruleset = { rules: Rule[] };

export type DiscountProfile = { id: string; name: string; discountRate: number };

export type PricingConfig = {
  pricing: {
    currency: string;
    vatRate: number;
    discountProfiles: DiscountProfile[];
  };
};

export type Selection = Record<string, string>; // moduleId -> optionId
