import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveConfig } from "@/lib/config/sheets";

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const res = await saveConfig(payload as Record<string, string | number>);
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 502 });
  }

  // Propagar a páginas que dependen de config
  revalidatePath("/reservar");
  revalidatePath("/admin/configuracion/pago");
  revalidatePath("/admin/configuracion/horarios");
  return NextResponse.json({ ok: true });
}
