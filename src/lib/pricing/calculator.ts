/**
 * Lookups y totales para precios y horas, con fallback a formula cuando la
 * combinación ancho × alto no existe en la matriz del Sheet.
 */

import type { TattooData } from "@/lib/validations/booking";
import type {
  HoursMatrices,
  Matrix,
  PricingMatrices,
  TattooEstimate
} from "./types";

function lookupExact(matrix: Matrix, widthCm: number, heightCm: number): number | null {
  const w = Math.round(widthCm);
  const h = Math.round(heightCm);
  const ci = matrix.widths.indexOf(w);
  const ri = matrix.heights.indexOf(h);
  if (ci < 0 || ri < 0) return null;
  const v = matrix.matrix[ri]?.[ci];
  return typeof v === "number" ? v : null;
}

// Formula simple de fallback si la matriz no tiene esa combinación
function fallbackPrice(t: Pick<TattooData, "widthCm" | "heightCm" | "style">): number {
  const area = t.widthCm * t.heightCm;
  const base = 35_000;
  const perCm2 = t.style === "realista" ? 900 : 650;
  const estimate = base + area * perCm2;
  return Math.round(estimate / 1000) * 1000;
}

function fallbackHours(t: Pick<TattooData, "widthCm" | "heightCm" | "style">): number {
  const area = t.widthCm * t.heightCm;
  const base = t.style === "realista" ? 0.5 : 0;
  if (area <= 9) return 1 + base;
  if (area <= 25) return 1.5 + base;
  if (area <= 64) return 2 + base;
  if (area <= 100) return 2.5 + base;
  if (area <= 180) return 3 + base;
  if (area <= 300) return 4 + base;
  return 5 + base;
}

export function estimate(
  t: Pick<TattooData, "widthCm" | "heightCm" | "style">,
  matrices: { pricing: PricingMatrices; hours: HoursMatrices } | null
): TattooEstimate {
  if (!matrices) {
    return { price: fallbackPrice(t), hours: fallbackHours(t), fromMatrix: false };
  }
  const priceMatrix = matrices.pricing[t.style];
  const hoursMatrix = matrices.hours[t.style];

  const priceFromMatrix = priceMatrix ? lookupExact(priceMatrix, t.widthCm, t.heightCm) : null;
  const hoursFromMatrix = hoursMatrix ? lookupExact(hoursMatrix, t.widthCm, t.heightCm) : null;

  const price = priceFromMatrix ?? fallbackPrice(t);
  const hours = hoursFromMatrix ?? fallbackHours(t);

  return {
    price,
    hours,
    fromMatrix: priceFromMatrix != null && hoursFromMatrix != null
  };
}

export function totals(
  tattoos: Array<Pick<TattooData, "widthCm" | "heightCm" | "style">>,
  matrices: { pricing: PricingMatrices; hours: HoursMatrices } | null
): { price: number; hours: number; anySpecialSize: boolean } {
  let price = 0;
  let hours = 0;
  let anySpecialSize = false;
  for (const t of tattoos) {
    const e = estimate(t, matrices);
    price += e.price;
    hours += e.hours;
    if (!e.fromMatrix) anySpecialSize = true;
  }
  return { price, hours, anySpecialSize };
}

export function calculateDeposit(
  total: number,
  mode: "FIXED" | "PERCENTAGE" = "PERCENTAGE",
  value = 30
): number {
  if (mode === "FIXED") return value;
  return Math.round((total * (value / 100)) / 1000) * 1000;
}
