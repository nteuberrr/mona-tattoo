"use client";

import * as React from "react";
import { useBooking } from "./BookingContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  estimateHours,
  estimatePrice,
  totalHours,
  totalPrice,
  calculateDeposit
} from "@/lib/pricing/mock";
import { formatCLP, formatDateLong } from "@/lib/utils";

export function Step4Quote() {
  const { personal, tattoos, schedule, acceptedTerms, dispatch } = useBooking();
  const tTotal = totalPrice(tattoos);
  const hTotal = totalHours(tattoos);
  const deposit = calculateDeposit(tTotal, "PERCENTAGE", 30);

  if (!personal || !schedule) return null;

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h2 className="display-md">Tu cotización</h2>
        <p className="mt-3 text-ink-soft">
          Revisa todo antes de avanzar. El abono reserva tu cupo durante 30
          minutos mientras haces la transferencia.
        </p>
      </div>

      <section className="border border-line bg-surface p-6 md:p-8">
        <h3 className="eyebrow mb-4">Datos</h3>
        <div className="grid md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
          <Row k="Nombre" v={personal.name} />
          <Row k="Email" v={personal.email} />
          <Row k="Teléfono" v={personal.phone} />
          <Row k="Edad" v={`${personal.age} años`} />
        </div>
      </section>

      <section className="border border-line bg-surface p-6 md:p-8">
        <h3 className="eyebrow mb-4">Tatuajes</h3>
        <div className="divide-y divide-line">
          {tattoos.map((t, i) => (
            <div key={t.id} className="py-4 grid md:grid-cols-[1fr_auto] gap-4">
              <div>
                <div className="font-display text-xl">
                  Tatuaje {i + 1}
                  {t.isSpecialSize && (
                    <span className="ml-2 text-xs uppercase tracking-editorial text-warning">
                      ✦ Tamaño especial
                    </span>
                  )}
                </div>
                <div className="text-ink-soft text-sm mt-1">
                  {t.widthCm} × {t.heightCm} cm · <span className="capitalize">{t.style}</span> ·{" "}
                  <span className="capitalize">{t.color}</span> · <span className="capitalize">{t.bodyPart}</span>
                </div>
                <p className="text-sm text-ink-soft mt-2 line-clamp-2">{t.description}</p>
              </div>
              <div className="text-right whitespace-nowrap">
                <div className="text-muted text-xs uppercase tracking-editorial">
                  {estimateHours(t)} h
                </div>
                <div className="font-display text-2xl mt-1">
                  {formatCLP(estimatePrice(t))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-line bg-surface p-6 md:p-8">
        <h3 className="eyebrow mb-4">Horario</h3>
        <div className="text-sm">
          <div className="font-display text-xl capitalize">
            {formatDateLong(schedule.date)}
          </div>
          <div className="text-ink-soft mt-1">
            {schedule.startTime} hrs · duración estimada {hTotal} h
          </div>
        </div>
      </section>

      <section className="border border-ink bg-ink text-bg p-6 md:p-8">
        <div className="flex items-baseline justify-between gap-6">
          <span className="eyebrow !text-bg/60">Total estimado</span>
          <span className="font-display text-4xl">{formatCLP(tTotal)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-6 mt-3 pt-3 border-t border-bg/20">
          <span className="text-bg/70 text-sm">Abono para reservar (30% aprox.)</span>
          <span className="font-display text-2xl">{formatCLP(deposit)}</span>
        </div>
      </section>

      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={(v) => dispatch({ type: "setAcceptedTerms", value: !!v })}
        />
        <label htmlFor="terms" className="text-sm text-ink-soft cursor-pointer max-w-xl">
          He leído y acepto las <a href="/terminos" className="underline">condiciones</a> y la política
          de abono. Entiendo que el abono no es reembolsable y que puedo reagendar con mínimo 48 hrs
          de anticipación.
        </label>
      </div>

      <div className="pt-4 flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" onClick={() => dispatch({ type: "goTo", step: 3 })}>
          ← Volver a editar
        </Button>
        <Button
          onClick={() => dispatch({ type: "goTo", step: 5 })}
          disabled={!acceptedTerms}
        >
          Quiero avanzar →
        </Button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-editorial text-muted">{k}</div>
      <div className="text-ink">{v}</div>
    </div>
  );
}
