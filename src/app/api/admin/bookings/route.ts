import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllBookings } from "@/lib/bookings";
import { callSheets, isSheetsConfigured } from "@/lib/sheets/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const { bookings, source } = await getAllBookings();
  return NextResponse.json({ bookings, source });
}

/**
 * POST: crea cita manual desde el admin. Entra directo en CONFIRMED.
 * Body: { client:{name,email,phone,age?,gender?}, schedule:{date,startTime,endTime},
 *         tattoos:[...], totalHours, totalPrice, depositAmount?, notes? }
 */
export async function POST(req: Request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ error: "Sheets no configurado" }, { status: 503 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload?.client?.name || !payload?.schedule?.date) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const res = await callSheets<{ id: string; status: string }>("createBooking", {
    ...payload,
    initialStatus: "CONFIRMED"
  });

  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 502 });
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/admin/dashboard");
  return NextResponse.json({ id: res.data.id, status: res.data.status }, { status: 201 });
}
