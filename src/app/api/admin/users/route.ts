import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createUserAction, fetchUsers } from "@/lib/users/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = await fetchUsers();
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload?.nombre || !payload?.email || !payload?.password) {
    return NextResponse.json({ error: "nombre, email y password son requeridos" }, { status: 400 });
  }
  const res = await createUserAction({
    nombre: payload.nombre,
    email: payload.email,
    password: payload.password,
    rol: payload.rol ?? "admin",
    activo: payload.activo !== false
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });
  revalidatePath("/admin/configuracion/usuarios");
  return NextResponse.json({ ok: true }, { status: 201 });
}
