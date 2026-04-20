import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createBlock, deleteBlock, fetchBlocks } from "@/lib/blocks/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  const blocks = await fetchBlocks();
  return NextResponse.json({ blocks });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload || !payload.date) {
    return NextResponse.json({ error: "date es requerido" }, { status: 400 });
  }
  const res = await createBlock({
    date: payload.date,
    startTime: payload.startTime || undefined,
    endTime: payload.endTime || undefined,
    reason: payload.reason || "",
    allDay: !!payload.allDay
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });
  revalidatePath("/reservar");
  revalidatePath("/admin/configuracion/bloqueos");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
  const res = await deleteBlock(id);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });
  revalidatePath("/reservar");
  revalidatePath("/admin/configuracion/bloqueos");
  return NextResponse.json({ ok: true });
}
