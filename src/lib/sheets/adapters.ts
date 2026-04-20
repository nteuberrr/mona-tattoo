/**
 * Convierte las filas planas que retorna el Apps Script (getBookings) al tipo
 * Booking que el admin consume. Hace parsing defensivo — los valores pueden
 * venir como número, string, boolean, o vacíos, dependiendo del formato de
 * celda.
 */

import type { Booking, BookingStatus, Tattoo } from "@/lib/mock-bookings";

type RawTattoo = {
  tatuaje_id: string | number;
  reserva_id: string;
  orden: number | string;
  descripcion: string;
  estilo: string;
  ancho_cm: number | string;
  alto_cm: number | string;
  tamano_especial: string | boolean;
  lugar_cuerpo: string;
  color: string;
  precio: number | string;
  urls_referencias: string;
};

type RawBooking = {
  id: string;
  creada_en: string | Date;
  estado: string;
  cliente_id: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  cliente_edad: number | string;
  cliente_genero: string;
  fecha_cita: string | Date;
  hora_inicio: string | number;
  hora_fin: string | number;
  horas_total: number | string;
  precio_total: number | string;
  monto_abono: number | string;
  abono_pagado: string | boolean;
  ref_transferencia: string;
  url_comprobante: string;
  notas_admin: string;
  pendiente_desde: string | Date;
  confirmada_en: string | Date;
  cliente_notificado_en: string | Date;
  motivo_rechazo: string;
  slot_hold_hasta: string | Date;
  tattoos?: RawTattoo[];
};

const toNumber = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v.replace(",", "."));
  return 0;
};

const toBool = (v: unknown): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.trim().toUpperCase() === "TRUE";
  return false;
};

const toISOString = (v: unknown): string | undefined => {
  if (!v) return undefined;
  if (v instanceof Date) return v.toISOString();
  const s = String(v).trim();
  if (!s) return undefined;
  return s;
};

const toDateString = (v: unknown): string => {
  if (!v) return "";
  if (v instanceof Date) {
    // Google Sheets puede devolver una Date con tz local — tomar solo YYYY-MM-DD
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = String(v).trim();
  // si viene "2026-04-22T..." cortar al T
  if (s.includes("T")) return s.split("T")[0];
  return s;
};

const toTimeString = (v: unknown): string => {
  if (!v) return "";
  if (v instanceof Date) {
    const h = String(v.getHours()).padStart(2, "0");
    const m = String(v.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
  const s = String(v).trim();
  // si es un float (hora como fracción de día), convertir
  if (/^\d*\.\d+$/.test(s)) {
    const frac = Number(s);
    const totalMin = Math.round(frac * 24 * 60);
    const h = String(Math.floor(totalMin / 60)).padStart(2, "0");
    const m = String(totalMin % 60).padStart(2, "0");
    return `${h}:${m}`;
  }
  return s;
};

const VALID_STATUSES: BookingStatus[] = [
  "QUOTED",
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED"
];

const toStatus = (v: unknown): BookingStatus => {
  const s = String(v).trim().toUpperCase() as BookingStatus;
  return VALID_STATUSES.includes(s) ? s : "QUOTED";
};

const toStyle = (v: unknown): Tattoo["style"] => {
  const s = String(v).trim().toLowerCase();
  return s === "realista" ? "realista" : "lineal";
};

const toColor = (v: unknown): Tattoo["color"] => {
  const s = String(v).trim().toLowerCase();
  if (s === "rojo") return "rojo";
  if (s === "blanco") return "blanco";
  return "negro";
};

export function rawToTattoo(r: RawTattoo): Tattoo {
  return {
    id: String(r.tatuaje_id),
    description: String(r.descripcion ?? ""),
    style: toStyle(r.estilo),
    widthCm: toNumber(r.ancho_cm),
    heightCm: toNumber(r.alto_cm),
    bodyPart: String(r.lugar_cuerpo ?? ""),
    color: toColor(r.color),
    price: toNumber(r.precio),
    referenceImages: String(r.urls_referencias ?? "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
  };
}

export function rawToBooking(r: RawBooking): Booking {
  return {
    id: String(r.id),
    client: {
      id: String(r.cliente_id),
      name: String(r.cliente_nombre ?? ""),
      email: String(r.cliente_email ?? ""),
      phone: String(r.cliente_telefono ?? ""),
      age: toNumber(r.cliente_edad)
    },
    date: toDateString(r.fecha_cita),
    startTime: toTimeString(r.hora_inicio),
    endTime: toTimeString(r.hora_fin),
    totalHours: toNumber(r.horas_total),
    totalPrice: toNumber(r.precio_total),
    depositAmount: toNumber(r.monto_abono),
    depositPaid: toBool(r.abono_pagado),
    status: toStatus(r.estado),
    tattoos: (r.tattoos ?? []).map(rawToTattoo),
    notes: String(r.notas_admin ?? "") || undefined,
    transferReference: String(r.ref_transferencia ?? "") || undefined,
    transferReceiptUrl: String(r.url_comprobante ?? "") || undefined,
    rejectionReason: String(r.motivo_rechazo ?? "") || undefined,
    pendingSince: toISOString(r.pendiente_desde),
    confirmedAt: toISOString(r.confirmada_en),
    createdAt: toISOString(r.creada_en) ?? new Date().toISOString()
  };
}
