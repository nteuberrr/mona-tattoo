import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { callSheets, isSheetsConfigured } from "@/lib/sheets/client";

/**
 * POST: guarda matriz de horas (lineal / realista) en la Sheet.
 * Body: { lineal?: MatrixData, realista?: MatrixData }
 */
export async function POST(req: Request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json(
      { error: "Google Sheets no está configurado en este deploy." },
      { status: 503 }
    );
  }

  const payload = await req.json().catch(() => null);
  if (!payload || (!payload.lineal && !payload.realista)) {
    return NextResponse.json(
      { error: "Payload debe traer 'lineal' o 'realista'." },
      { status: 400 }
    );
  }

  const res = await callSheets("saveHours", payload);
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 502 });
  }
  revalidatePath("/reservar");
  return NextResponse.json({ ok: true });
}
