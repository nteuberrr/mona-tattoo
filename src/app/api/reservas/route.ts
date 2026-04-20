import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { callSheets, isSheetsConfigured } from "@/lib/sheets/client";
import { getAllBookings } from "@/lib/bookings";
import { fetchBlocks } from "@/lib/blocks/sheets";
import { getConfig } from "@/lib/config/sheets";
import { buildScheduleSnapshot, isSlotAvailable } from "@/lib/scheduling/availability";

/**
 * Recibe el payload del Paso 5 ("Ya transferí") y lo escribe en la Sheet.
 * Antes de escribir, valida que el slot principal y los bloques adicionales
 * sigan disponibles (race condition: alguien pudo haber reservado mientras
 * el cliente decidía).
 */
export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const additionalBlocks = (payload.schedule?.additionalBlocks ?? []) as Array<{
    date: string;
    startTime: string;
  }>;
  const totalHours = payload.totalHours ?? sumTattooHours(payload.tattoos);
  const hoursPerBlock = additionalBlocks.length > 0
    ? Math.min(3, totalHours / (1 + additionalBlocks.length))
    : totalHours;

  // CONFLICT CHECK
  if (isSheetsConfigured()) {
    const [{ bookings }, blocks, config] = await Promise.all([
      getAllBookings(),
      fetchBlocks(),
      getConfig()
    ]);
    const snapshot = buildScheduleSnapshot({
      bookings,
      blocks,
      config,
      fromDate: new Date(),
      daysAhead: 90
    });

    const allBlocks = [
      { date: payload.schedule?.date, startTime: payload.schedule?.startTime },
      ...additionalBlocks
    ];
    for (const b of allBlocks) {
      if (!b.date || !b.startTime) continue;
      const ok = isSlotAvailable(snapshot, b.date, b.startTime, hoursPerBlock);
      if (!ok) {
        return NextResponse.json(
          {
            error: `El horario ${b.startTime} del ${b.date} ya no está disponible. Vuelve atrás y elige otro.`
          },
          { status: 409 }
        );
      }
    }
  }

  // Persistir additionalBlocks dentro de notas_admin (formato JSON marcado)
  const notes = additionalBlocks.length > 0
    ? `[BLOCKS]: ${JSON.stringify(additionalBlocks.map((b) => ({ ...b, hours: hoursPerBlock })))}`
    : "";

  const sheetsPayload = {
    client: {
      name: payload.personal?.name,
      email: payload.personal?.email,
      phone: payload.personal?.phone,
      age: payload.personal?.age,
      gender: payload.personal?.gender
    },
    schedule: {
      date: payload.schedule?.date,
      startTime: payload.schedule?.startTime,
      endTime: payload.schedule?.endTime ?? computeEndTime(payload.schedule?.startTime, hoursPerBlock)
    },
    tattoos: (payload.tattoos ?? []).map((t: any) => ({
      description: t.description,
      style: t.style,
      widthCm: t.widthCm,
      heightCm: t.heightCm,
      isSpecialSize: !!t.isSpecialSize,
      bodyPart: t.bodyPart,
      color: t.color,
      price: t.price ?? 0,
      referenceImages: t.referenceImages ?? []
    })),
    totalHours,
    totalPrice: payload.totalPrice ?? 0,
    depositAmount: payload.depositAmount ?? 0,
    transferReference: payload.transferReference ?? null,
    transferReceiptUrl: payload.transferReceiptUrl ?? null,
    notes
  };

  if (!isSheetsConfigured()) {
    console.log("[api/reservas] Sheets no configurado — respondiendo demo id");
    return NextResponse.json(
      { id: `demo-${Date.now()}`, status: "PENDING_CONFIRMATION", source: "mock" },
      { status: 201 }
    );
  }

  const res = await callSheets<{ id: string; status: string }>(
    "createBooking",
    sheetsPayload
  );

  if (!res.ok) {
    console.error("[api/reservas] Error escribiendo en Sheets:", res.error);
    return NextResponse.json(
      { error: "No se pudo registrar la reserva. Reintenta en unos segundos." },
      { status: 502 }
    );
  }

  // Invalidar caché de la página pública para que el siguiente cliente
  // vea los slots actualizados al instante
  revalidatePath("/reservar");

  return NextResponse.json(
    { id: res.data.id, status: res.data.status, source: "sheets" },
    { status: 201 }
  );
}

function computeEndTime(start: string | undefined, hours: number): string | undefined {
  if (!start) return undefined;
  if (!hours) return start;
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + (m ?? 0) + Math.ceil(hours * 60);
  const eh = Math.floor(total / 60);
  const em = Math.round(total % 60);
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}

function sumTattooHours(tattoos: any[]): number {
  if (!Array.isArray(tattoos)) return 0;
  return tattoos.reduce((acc, t) => acc + (t.hours || 0), 0);
}
