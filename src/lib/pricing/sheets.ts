/**
 * Obtiene las 4 matrices (precios lineal/realista, horas lineal/realista)
 * desde Google Sheets vía Apps Script. Normaliza los valores porque las
 * celdas pueden venir como número o string según el formato.
 */

import { callSheets, isSheetsConfigured } from "@/lib/sheets/client";
import type { HoursMatrices, Matrix, PricingMatrices } from "./types";

type RawMatrix = {
  widths: (number | string)[];
  heights: (number | string)[];
  matrix: (number | string | null | "")[][];
};

type GetPricingResponse = {
  prices: { lineal: RawMatrix; realista: RawMatrix };
  hours: { lineal: RawMatrix; realista: RawMatrix };
};

function normalizeMatrix(raw: RawMatrix | undefined): Matrix | null {
  if (!raw) return null;
  const widths = (raw.widths ?? []).map(toNum).filter((n): n is number => n != null);
  const heights = (raw.heights ?? []).map(toNum).filter((n): n is number => n != null);
  if (widths.length === 0 || heights.length === 0) return null;

  const rows = raw.matrix ?? [];
  // normalizar a la forma heights.length × widths.length
  const matrix: (number | null)[][] = heights.map((_, i) => {
    const rawRow = rows[i] ?? [];
    return widths.map((_, j) => toNum(rawRow[j]));
  });

  // si TODO está en null, tratamos como no configurado
  const anyValue = matrix.some((row) => row.some((v) => v != null));
  if (!anyValue) return null;

  return { widths, heights, matrix };
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const raw = v.replace(/[^\d,.\-]/g, "");
    if (!raw) return null;
    // Formato chileno: "55.000" → 55000. Heurística:
    // - si contiene ',' → coma es decimal, puntos son miles
    // - si solo '.' y últimos dígitos son exactamente 3 → es separador de miles
    // - caso normal: parsear directo
    let cleaned = raw;
    if (raw.includes(",")) {
      cleaned = raw.replace(/\./g, "").replace(",", ".");
    } else if ((raw.match(/\./g) || []).length > 1) {
      cleaned = raw.replace(/\./g, "");
    } else if (raw.includes(".")) {
      const after = raw.split(".").pop() ?? "";
      if (after.length === 3) cleaned = raw.replace(/\./g, "");
    }
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function fetchMatrices(): Promise<{
  pricing: PricingMatrices;
  hours: HoursMatrices;
  source: "sheets" | "fallback";
}> {
  const fallback = {
    pricing: { lineal: null, realista: null },
    hours: { lineal: null, realista: null },
    source: "fallback" as const
  };

  if (!isSheetsConfigured()) return fallback;

  const res = await callSheets<GetPricingResponse>("getPricing");
  if (!res.ok) {
    console.error("[pricing/sheets] getPricing falló:", res.error);
    return fallback;
  }

  return {
    pricing: {
      lineal: normalizeMatrix(res.data.prices?.lineal),
      realista: normalizeMatrix(res.data.prices?.realista)
    },
    hours: {
      lineal: normalizeMatrix(res.data.hours?.lineal),
      realista: normalizeMatrix(res.data.hours?.realista)
    },
    source: "sheets"
  };
}
