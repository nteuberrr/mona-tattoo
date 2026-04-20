import { NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/bookings";
import type { BookingStatus } from "@/lib/mock-bookings";

const VALID: BookingStatus[] = [
  "QUOTED",
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED"
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body?.status as BookingStatus | undefined;

  if (!status || !VALID.includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const res = await updateBookingStatus(id, status, body?.rejectionReason);
  if (!res.ok) {
    return NextResponse.json({ error: res.error ?? "Error actualizando" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id, status, source: res.source });
}
