import { NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_TTL_MS, signSession } from "@/lib/auth/session";
import { validateUserAction } from "@/lib/users/sheets";

/**
 * Auth flujo:
 * 1. Intenta validar contra la hoja Usuarios de Google Sheets.
 * 2. Si la Sheet está vacía o no configurada, cae a las env vars (bootstrap).
 * 3. En cualquier caso, la cookie firmada se emite con el email validado.
 */
export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    console.error("[login] NEXTAUTH_SECRET no configurado");
    return NextResponse.json(
      { error: "El servidor no tiene credenciales configuradas." },
      { status: 503 }
    );
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
  }

  // 1. Intentar validar contra Sheet
  const sheetResult = await validateUserAction(email, password);
  let authedEmail: string | null = null;

  if (sheetResult.user) {
    authedEmail = sheetResult.user.email;
  } else if (!sheetResult.sheetHasUsers) {
    // 2. Sheet vacía o no accesible → fallback a env vars
    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_INITIAL_PASSWORD;
    if (envEmail && envPassword && email === envEmail && password === envPassword) {
      authedEmail = envEmail;
    }
  }

  if (!authedEmail) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = await signSession(authedEmail, secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000)
  });
  return res;
}
