/**
 * Capa de acceso a reservas. Prefiere Google Sheets (via webhook) cuando está
 * configurado. Si no, cae al mock para que el dev local funcione sin setup.
 */

import { callSheets, isSheetsConfigured } from "./sheets/client";
import { rawToBooking } from "./sheets/adapters";
import { SEED_BOOKINGS, type Booking, type BookingStatus } from "./mock-bookings";

export type Source = "sheets" | "mock";

export async function getAllBookings(): Promise<{ bookings: Booking[]; source: Source }> {
  if (!isSheetsConfigured()) {
    return { bookings: SEED_BOOKINGS, source: "mock" };
  }

  const res = await callSheets<{ bookings: unknown[] }>("getBookings");
  if (!res.ok) {
    console.error("[bookings] getAllBookings fallo:", res.error);
    return { bookings: SEED_BOOKINGS, source: "mock" };
  }

  const raw = Array.isArray(res.data?.bookings) ? res.data.bookings : [];
  const bookings = raw.map((r) => rawToBooking(r as Parameters<typeof rawToBooking>[0]));
  return { bookings, source: "sheets" };
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  rejectionReason?: string
): Promise<{ ok: boolean; error?: string; source: Source }> {
  if (!isSheetsConfigured()) {
    console.warn("[bookings] updateBookingStatus llamado sin Sheets — cambio no persiste");
    return { ok: true, source: "mock" };
  }

  const res = await callSheets("updateBookingStatus", {
    id,
    status,
    rejectionReason
  });
  if (!res.ok) {
    return { ok: false, error: res.error, source: "sheets" };
  }
  return { ok: true, source: "sheets" };
}
