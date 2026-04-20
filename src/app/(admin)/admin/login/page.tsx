"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo iniciar sesión");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="font-display text-2xl inline-block mb-10 hover:opacity-70"
        >
          Mona Tatt ✦
        </Link>
        <h1 className="display-md">Panel admin</h1>
        <p className="mt-3 text-ink-soft">
          Ingresa con las credenciales del estudio.
        </p>

        <form onSubmit={submit} className="mt-10 space-y-6">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Contraseña</Label>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Entrando…" : "Entrar"}
          </Button>

          <p className="text-xs text-muted pt-2 border-t border-line">
            Fase 1.5 — auth simple via cookie. En Fase 2 se migra a NextAuth.
            Credenciales de prueba se configuran en tu{" "}
            <code className="text-ink">.env</code> (ADMIN_EMAIL /
            ADMIN_INITIAL_PASSWORD).
          </p>
        </form>
      </div>
    </main>
  );
}
