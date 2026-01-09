import type { Catalog, PricingConfig, Selection } from "../types";

export type PriceBreakdown = {
  currency: string;
  base: number;
  options: number;
  subtotal: number;
  discountRate: number;
  discount: number;
  net: number;
  vatRate: number;
  vat: number;
  total: number;
};

export function computePrice(
  catalog: Catalog,
  pricing: PricingConfig,
  modelId: string,
  selection: Selection,
  discountProfileId: string
): PriceBreakdown {
  const model = catalog.models.find(m => m.id === modelId);
  if (!model) throw new Error(`Model not found: ${modelId}`);

  const moduleMap = new Map(catalog.modules.map(m => [m.id, m]));
  let optionsTotal = 0;

  for (const moduleId of model.modules) {
    const optId = selection[moduleId];
    if (!optId) continue;
    const mod = moduleMap.get(moduleId);
    const opt = mod?.options.find(o => o.id === optId);
    if (opt) optionsTotal += opt.priceDelta;
  }

  const currency = pricing.pricing.currency;
  const vatRate = pricing.pricing.vatRate;
  const dp = pricing.pricing.discountProfiles.find(d => d.id === discountProfileId) ?? pricing.pricing.discountProfiles[0];
  const discountRate = dp?.discountRate ?? 0;

  const base = model.basePrice;
  const subtotal = base + optionsTotal;
  const discount = subtotal * discountRate;
  const net = subtotal - discount;
  const vat = net * vatRate;
  const total = net + vat;

  return {
    currency,
    base,
    options: optionsTotal,
    subtotal,
    discountRate,
    discount,
    net,
    vatRate,
    vat,
    total
  };
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount);
}
