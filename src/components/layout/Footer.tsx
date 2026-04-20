"use client";

import Link from "next/link";
import { Instagram, Mail, ArrowUp, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="container mx-auto py-16 grid gap-12 md:grid-cols-3 items-start">
        <div>
          <div className="font-display text-3xl">Mona Tatt ✦</div>
          <p className="mt-4 text-sm text-ink-soft max-w-xs">
            Tatuaje fineline y botánico. Sesiones con cupo limitado, agendadas con tiempo.
          </p>
        </div>

        <nav className="flex flex-col gap-3 text-sm">
          <span className="eyebrow">Navegar</span>
          <Link href="/" className="hover:opacity-70">Inicio</Link>
          <Link href="/reservar" className="hover:opacity-70">Reservar</Link>
          <Link href="/#guidelines" className="hover:opacity-70">Recomendaciones</Link>
          <Link href="/privacidad" className="hover:opacity-70 text-muted">Política de privacidad</Link>
          <Link href="/terminos" className="hover:opacity-70 text-muted">Términos</Link>
        </nav>

        <div className="flex flex-col gap-3 text-sm">
          <span className="eyebrow">Contacto</span>
          <a
            href="mailto:agenda.monatatt@gmail.com"
            className="inline-flex items-center gap-2 hover:opacity-70"
          >
            <Mail className="h-4 w-4" />
            agenda.monatatt@gmail.com
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 hover:opacity-70"
          >
            <Instagram className="h-4 w-4" />
            @mona.tatt
          </a>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 py-6 text-xs text-muted">
          <span>© {new Date().getFullYear()} Mona Tatt. Todos los derechos reservados.</span>

          <div className="flex items-center gap-6">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase tracking-editorial"
              aria-label="Acceso al panel admin"
            >
              <Lock className="h-3 w-3" />
              Acceso admin
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 hover:text-ink transition-colors"
            >
              Volver arriba <ArrowUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
