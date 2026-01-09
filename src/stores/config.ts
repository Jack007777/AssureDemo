import { defineStore } from "pinia";
import catalogJson from "../data/catalog.json";
import rulesJson from "../data/rules.json";
import pricingJson from "../data/pricing.json";
import type { Catalog, PricingConfig, Ruleset, Selection } from "../types";
import { validateSelection, type RuleIssue } from "../lib/rules";
import { computePrice, type PriceBreakdown } from "../lib/pricing";

export const useConfigStore = defineStore("config", {
  state: () => ({
    catalog: catalogJson as Catalog,
    ruleset: rulesJson as Ruleset,
    pricing: pricingJson as PricingConfig,

    modelId: "S5",
    discountProfileId: "retail",

    selection: {} as Selection
  }),
  getters: {
    model(state) {
      return state.catalog.models.find(m => m.id === state.modelId);
    },
    issues(state): RuleIssue[] {
      return validateSelection(state.ruleset, state.selection);
    },
    isValid(): boolean {
      return this.issues.filter(i => i.severity === "error").length === 0;
    },
    price(state): PriceBreakdown {
      return computePrice(state.catalog, state.pricing, state.modelId, state.selection, state.discountProfileId);
    }
  },
  actions: {
    setModel(modelId: string) {
      this.modelId = modelId;
      this.selection = {};
    },
    setDiscountProfile(id: string) {
      this.discountProfileId = id;
    },
    setOption(moduleId: string, optionId: string) {
      this.selection[moduleId] = optionId;
    }
  }
});
