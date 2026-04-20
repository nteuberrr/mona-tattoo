import { NextResponse } from "next/server";

/**
 * ⚠️ Fase 1.5 — auth básico con cookie httpOnly (no firmada).
 * En Fase 2 esto se reemplaza por NextAuth credentials + JWT signed sessions.
 *
 * En producción EXIGE ADMIN_EMAIL + ADMIN_INITIAL_PASSWORD seteados. Si no
 * están, rechaza cualquier login (evita la vulnerabilidad de credenciales por
 * defecto si alguien despliega sin configurar el env).
 */
export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));

  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    console.error(
      "[api/admin/login] ADMIN_EMAIL o ADMIN_INITIAL_PASSWORD no seteados."
    );
    return NextResponse.json(
      { error: "El servidor no tiene credenciales configuradas." },
      { status: 503 }
    );
  }

  if (email !== expectedEmail || password !== expectedPassword) {
    return NextResponse.json(
      { error: "Credenciales incorrectas" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("monatatt_admin_session", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8 // 8 hrs
  });
  return res;
}
