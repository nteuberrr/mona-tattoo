"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Pricing() {
  return (
    <section id="precios" className="section bg-ink text-bg">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="eyebrow !text-bg/60">Inversión</span>
          <h2 className="display-lg mt-3 text-bg">
            Cada tatuaje,
            <br />
            <span className="italic">una pieza única.</span>
          </h2>
        </div>
        <div className="space-y-6 text-bg/80">
          <p>
            El valor depende del tamaño, color y complejidad del diseño. La
            cotización exacta aparece durante la reserva — antes de cualquier
            compromiso.
          </p>
          <p>
            Trabajo con una tabla transparente que considera las dimensiones y
            el color. No hay letra chica: ves el precio antes de confirmar.
          </p>
          <div className="pt-2">
            <Button
              asChild
              variant="secondary"
              className="!border-bg !text-bg hover:!bg-bg hover:!text-ink"
            >
              <Link href="/reservar">Ver mi cotización</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
