import { NextResponse } from "next/server";

/**
 * STUB Fase 1 — solo loggea y responde un ID fake.
 * En Fase 2:
 *  - validar payload con Zod (bookingSchema)
 *  - crear Client + Booking + Tattoo en Prisma con estado PENDING_CONFIRMATION
 *  - subir referenceImages a Supabase Storage
 *  - disparar mail al admin (Resend)
 */
export async function POST(req: Request) {
  const payload = await req.json();
  console.log("[api/reservas] nueva reserva recibida (stub):", {
    cliente: payload.personal?.name,
    email: payload.personal?.email,
    tatuajes: payload.tattoos?.length,
    fecha: payload.schedule?.date,
    hora: payload.schedule?.startTime,
    total: payload.totalPrice,
    abono: payload.depositAmount
  });

  return NextResponse.json(
    {
      id: `demo-${Date.now()}`,
      status: "PENDING_CONFIRMATION",
      message: "Reserva recibida. Admin será notificado."
    },
    { status: 201 }
  );
}
