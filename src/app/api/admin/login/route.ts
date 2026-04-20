import { NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_TTL_MS, signSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));

  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_INITIAL_PASSWORD;
  const secret = process.env.NEXTAUTH_SECRET;

  if (!expectedEmail || !expectedPassword || !secret) {
    console.error(
      "[api/admin/login] Falta ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD o NEXTAUTH_SECRET."
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

  const token = await signSession(email, secret);

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
