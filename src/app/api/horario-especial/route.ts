import { NextResponse } from "next/server";
import { callSheets, isSheetsConfigured } from "@/lib/sheets/client";

/**
 * Solicitud de horario fuera de agenda desde el Paso 3 del flujo.
 */
export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const sheetsPayload = {
    type: "schedule",
    clientName: payload.clientName ?? "",
    clientEmail: payload.clientEmail ?? "",
    clientPhone: payload.clientPhone ?? "",
    details: {
      desiredDate: payload.desiredDate,
      desiredTime: payload.desiredTime,
      reason: payload.reason
    }
  };

  if (!isSheetsConfigured()) {
    console.log("[api/horario-especial] Sheets no configurado — solo log:", sheetsPayload);
    return NextResponse.json({ ok: true, source: "mock" }, { status: 201 });
  }

  const res = await callSheets("createSpecialRequest", sheetsPayload);
  if (!res.ok) {
    console.error("[api/horario-especial] Error:", res.error);
    return NextResponse.json(
      { error: "No se pudo registrar la solicitud." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, source: "sheets" }, { status: 201 });
}
