import { NextResponse } from "next/server";

/**
 * STUB Fase 1. En Fase 2:
 *  - validar con specialScheduleSchema
 *  - crear SpecialRequest en DB
 *  - disparar mail al admin (plantilla special-request)
 */
export async function POST(req: Request) {
  const payload = await req.json();
  console.log("[api/horario-especial] solicitud recibida (stub):", payload);
  return NextResponse.json({ ok: true }, { status: 201 });
}
