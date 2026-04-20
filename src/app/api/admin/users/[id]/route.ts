import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteUserAction, updateUserAction } from "@/lib/users/sheets";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await req.json().catch(() => ({}));
  const res = await updateUserAction({ id, ...payload });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });
  revalidatePath("/admin/configuracion/usuarios");
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await deleteUserAction(id);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });
  revalidatePath("/admin/configuracion/usuarios");
  return NextResponse.json({ ok: true });
}
