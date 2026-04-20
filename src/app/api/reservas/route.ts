import { NextResponse } from "next/server";
import { callSheets, isSheetsConfigured } from "@/lib/sheets/client";

/**
 * Recibe el payload del Paso 5 del flujo ("Ya transferí") y lo escribe en la
 * Sheet vía Apps Script. Si SHEETS_WEBHOOK_URL no está configurado, solo
 * loggea y responde un ID fake (útil en dev sin setup).
 */
export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  // Payload esperado desde Step5Transfer.tsx:
  // { personal, tattoos, schedule, totalPrice, depositAmount, transferReference }
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
      endTime: payload.schedule?.endTime ?? computeEndTime(payload.schedule?.startTime, payload.tattoos)
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
    totalHours: payload.totalHours ?? sumTattooHours(payload.tattoos),
    totalPrice: payload.totalPrice ?? 0,
    depositAmount: payload.depositAmount ?? 0,
    transferReference: payload.transferReference ?? null,
    transferReceiptUrl: payload.transferReceiptUrl ?? null
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

  return NextResponse.json(
    { id: res.data.id, status: res.data.status, source: "sheets" },
    { status: 201 }
  );
}

function computeEndTime(start: string | undefined, tattoos: any[]): string | undefined {
  if (!start) return undefined;
  const hours = sumTattooHours(tattoos);
  if (!hours) return start;
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + (m ?? 0) + hours * 60;
  const eh = Math.floor(total / 60);
  const em = Math.round(total % 60);
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}

function sumTattooHours(tattoos: any[]): number {
  if (!Array.isArray(tattoos)) return 0;
  return tattoos.reduce((acc, t) => {
    const area = (t.widthCm ?? 0) * (t.heightCm ?? 0);
    if (area <= 9) return acc + 1;
    if (area <= 25) return acc + 1.5;
    if (area <= 64) return acc + 2;
    if (area <= 100) return acc + 2.5;
    if (area <= 180) return acc + 3;
    if (area <= 300) return acc + 4;
    return acc + 5;
  }, 0);
}
