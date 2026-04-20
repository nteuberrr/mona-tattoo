/**
 * Pricing & hour estimation — stub layer.
 * En Fase 2 esto se reemplaza por consultas a PriceTable / HourMatrix en DB.
 */
import type { TattooData } from "@/lib/validations/booking";

export function estimatePrice(t: Pick<TattooData, "widthCm" | "heightCm" | "color">): number {
  const area = t.widthCm * t.heightCm;
  const base = 25_000;
  const perCm2 = t.color === "blanco" ? 900 : t.color === "rojo" ? 800 : 650;
  const estimate = base + area * perCm2;
  return Math.round(estimate / 1000) * 1000;
}

export function estimateHours(t: Pick<TattooData, "widthCm" | "heightCm">): number {
  const area = t.widthCm * t.heightCm;
  if (area <= 9) return 1;
  if (area <= 25) return 1.5;
  if (area <= 64) return 2;
  if (area <= 100) return 2.5;
  if (area <= 180) return 3;
  if (area <= 300) return 4;
  return 5;
}

export function totalHours(tattoos: TattooData[]): number {
  return tattoos.reduce((acc, t) => acc + estimateHours(t), 0);
}

export function totalPrice(tattoos: TattooData[]): number {
  return tattoos.reduce((acc, t) => acc + estimatePrice(t), 0);
}

export function calculateDeposit(total: number, mode: "FIXED" | "PERCENTAGE" = "PERCENTAGE", value = 30): number {
  if (mode === "FIXED") return value;
  return Math.round((total * (value / 100)) / 1000) * 1000;
}
