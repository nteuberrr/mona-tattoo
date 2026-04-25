import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCLP(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(value);
}

function parseLocalDate(date: Date | string): Date {
  if (date instanceof Date) return date;
  // "YYYY-MM-DD" (fecha sola) → parsear como local, no UTC, para evitar
  // que en TZ negativas (Chile UTC-4) se corra un día atrás.
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(date);
}

export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = parseLocalDate(date);
  if (isNaN(d.getTime())) return String(date);
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(d);
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = parseLocalDate(date);
  if (isNaN(d.getTime())) return String(date);
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(d);
}

/** Horas con 1 decimal: 1 → "1.0 h", 1.5 → "1.5 h" */
export function formatHours(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(1)} h`;
}
