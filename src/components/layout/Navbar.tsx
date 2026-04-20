"use client";

import Link from "next/link";
import * as React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Trabajos", href: "/#trabajos" },
  { label: "Sobre mí", href: "/#sobre-mi" },
  { label: "Recomendaciones", href: "/#guidelines" },
  { label: "FAQ", href: "/#faq" }
];

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-colors duration-300",
        scrolled
          ? "bg-bg/90 backdrop-blur border-b border-line"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl tracking-tight hover:opacity-70 transition-opacity"
        >
          Mona Tatt
          <span className="text-muted ml-1">✦</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-editorial text-ink-soft hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild size="sm" variant="primary">
            <Link href="/reservar">Reservar</Link>
          </Button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 -mr-2"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-bg">
          <div className="container mx-auto flex flex-col py-6 gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-editorial"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild>
              <Link href="/reservar" onClick={() => setOpen(false)}>
                Reservar sesión
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
