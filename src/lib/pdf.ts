import jsPDF from "jspdf";
import type { Catalog, PricingConfig, Selection } from "../types";
import { computePrice, formatMoney } from "./pricing";

export function exportConfigPdf(args: {
  catalog: Catalog;
  pricing: PricingConfig;
  modelId: string;
  selection: Selection;
  discountProfileId: string;
}) {
  const { catalog, pricing, modelId, selection, discountProfileId } = args;
  const model = catalog.models.find(m => m.id === modelId);
  if (!model) throw new Error("Model not found");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;

  doc.setFontSize(18);
  doc.text("Wheelchair Configuration Sheet", margin, y);
  y += 22;

  doc.setFontSize(11);
  doc.text(`Model: ${model.name} (${model.id})`, margin, y);
  y += 16;
  const finalModelCode = buildModelCode(modelId, selection);
  doc.text(`Final Model: ${finalModelCode}`, margin, y);
  y += 16;
  if (model.leadTime) {
    doc.text(`Lead Time: ${model.leadTime}`, margin, y);
    y += 16;
  }
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 18;

  doc.setFontSize(12);
  doc.text("Selections", margin, y);
  y += 12;

  doc.setFontSize(10);
  const moduleMap = new Map(catalog.modules.map(m => [m.id, m]));
  for (const moduleId of model.modules) {
    const mod = moduleMap.get(moduleId);
    if (!mod) continue;
    const optId = selection[moduleId];
    const opt = mod.options.find(o => o.id === optId);
    const line = `${mod.name}: ${opt ? opt.label : "(not selected)"}`;
    doc.text(line, margin, y);
    y += 14;
    if (y > 760) {
      doc.addPage();
      y = margin;
    }
  }

  y += 10;
  const breakdown = computePrice(catalog, pricing, modelId, selection, discountProfileId);

  doc.setFontSize(12);
  doc.text("Price", margin, y);
  y += 12;

  doc.setFontSize(10);
  const rows = [
    ["Base", formatMoney(breakdown.base, breakdown.currency)],
    ["Options", formatMoney(breakdown.options, breakdown.currency)],
    ["Subtotal", formatMoney(breakdown.subtotal, breakdown.currency)],
    [`Discount (${Math.round(breakdown.discountRate * 100)}%)`, `- ${formatMoney(breakdown.discount, breakdown.currency)}`],
    ["Net", formatMoney(breakdown.net, breakdown.currency)],
    [`VAT (${Math.round(breakdown.vatRate * 100)}%)`, formatMoney(breakdown.vat, breakdown.currency)],
    ["Total", formatMoney(breakdown.total, breakdown.currency)]
  ];

  for (const [k, v] of rows) {
    doc.text(k, margin, y);
    doc.text(v, 360, y, { align: "left" });
    y += 14;
  }

  doc.save(`wheelchair-config-${model.id}.pdf`);
}

function buildModelCode(modelId: string, selection: Selection): string {
  const optionCodeMap: Record<string, string> = {
    "sw-36": "36",
    "sw-39": "39",
    "sw-42": "42",
    "sw-45": "45",
    "sw-48": "48",
    "sd-37-5": "375",
    "sd-40": "40",
    "sd-42-5": "425",
    "sd-45": "45",
    "sd-47-5": "475",
    "fa-100": "A100",
    "fa-90": "A90",
    "fl-std": "STD",
    "fl-long": "LONG",
    "rw-22-12": "22-12",
    "rw-22-18": "22-18",
    "rw-24-12": "24-12",
    "rw-24-18": "24-18",
    "rw-24-big": "24-BIG",
    "rw-24-carbon": "24-CF"
  };
  const order = ["seatWidth", "seatDepth", "frameAngle", "frameLength", "rearWheel"];
  const parts: string[] = [];
  for (const moduleId of order) {
    const optId = selection[moduleId];
    if (!optId) continue;
    parts.push(optionCodeMap[optId] ?? optId.toUpperCase());
  }
  return [modelId, ...parts].join("-");
}
