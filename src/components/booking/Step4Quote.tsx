"use client";

import * as React from "react";
import { useBooking } from "./BookingContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { totals, calculateDeposit } from "@/lib/pricing/calculator";
import { formatCLP, formatDateLong, formatHours } from "@/lib/utils";

export function Step4Quote() {
  const { personal, tattoos, schedule, acceptedTerms, dispatch, pricing, hours, payment, discount } = useBooking();
  const matrices = { pricing, hours };
  const t = totals(tattoos, matrices, discount);
  const tTotal = t.price;
  const hTotal = t.hours;
  const anySpecialSize = t.anySpecialSize;
  const deposit = calculateDeposit(tTotal, payment.depositMode, payment.depositValue);

  if (!personal || !schedule) return null;

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h2 className="display-md">Tu cotización</h2>
        <p className="mt-3 text-ink-soft">
          Revisa todo antes de avanzar. El abono reserva tu cupo durante 30
          minutos mientras haces la transferencia.
        </p>
        {anySpecialSize && (
          <div className="mt-4 bg-[#F6E6C4] text-[#6B5217] border border-[#D9B860] p-3 text-xs">
            ✦ Una o más dimensiones no están en la tabla estándar. Confirmaremos
            el precio final por correo antes de cobrar el abono.
          </div>
        )}
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
          {tattoos.map((tt, i) => {
            const item = t.items[i];
            return (
              <div key={tt.id} className="py-4 grid md:grid-cols-[1fr_auto] gap-4">
                <div>
                  <div className="font-display text-xl flex flex-wrap items-center gap-2">
                    Tatuaje {i + 1}
                    {!item.fromMatrix && (
                      <Badge variant="warning" className="text-[0.6rem]">
                        Tamaño especial
                      </Badge>
                    )}
                    {item.discount > 0 && (
                      <Badge variant="success" className="text-[0.6rem]">
                        −{discount.multiTattooPct}% descuento
                      </Badge>
                    )}
                  </div>
                  <div className="text-ink-soft text-sm mt-1">
                    {tt.widthCm} × {tt.heightCm} cm ·{" "}
                    <span className="capitalize">{tt.style}</span> ·{" "}
                    <span className="capitalize">{tt.color}</span> ·{" "}
                    <span className="capitalize">{tt.bodyPart}</span>
                  </div>
                  <p className="text-sm text-ink-soft mt-2 line-clamp-2">{tt.description}</p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="text-muted text-xs uppercase tracking-editorial">
                    {formatHours(item.hours)}
                  </div>
                  {item.discount > 0 ? (
                    <div className="mt-1 text-xs space-y-0.5">
                      <div className="flex items-baseline justify-end gap-2 text-ink-soft">
                        <span>Precio base</span>
                        <span className="font-mono">{formatCLP(item.priceBeforeDiscount)}</span>
                      </div>
                      <div className="flex items-baseline justify-end gap-2 text-[#3E5E3E]">
                        <span>Descuento ({discount.multiTattooPct}%)</span>
                        <span className="font-mono">−{formatCLP(item.discount)}</span>
                      </div>
                      <div className="flex items-baseline justify-end gap-2 pt-1 mt-1 border-t border-line">
                        <span className="uppercase tracking-editorial text-muted">Total</span>
                        <span className="font-display text-2xl">{formatCLP(item.price)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="font-display text-2xl mt-1">
                      {formatCLP(item.price)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border border-line bg-surface p-6 md:p-8">
        <h3 className="eyebrow mb-4">Horario</h3>
        <div className="text-sm space-y-3">
          <div>
            <div className="font-display text-xl capitalize">
              {formatDateLong(schedule.date)}
            </div>
            <div className="text-ink-soft mt-1">
              {schedule.startTime} hrs · duración estimada {formatHours(hTotal)}
            </div>
          </div>
          {schedule.additionalBlocks && schedule.additionalBlocks.length > 0 && (
            <div className="border-t border-line pt-3">
              <div className="text-xs uppercase tracking-editorial text-muted mb-2">
                Bloques adicionales
              </div>
              {schedule.additionalBlocks.map((b, i) => (
                <div key={i} className="text-ink-soft">
                  <span className="capitalize">{formatDateLong(b.date)}</span> · {b.startTime} hrs
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border border-ink bg-ink text-bg p-6 md:p-8 space-y-3">
        {t.discountTotal > 0 && (
          <div className="flex items-baseline justify-between gap-6 text-sm">
            <span className="text-bg/70">
              Subtotal antes de descuento
            </span>
            <span className="font-display">{formatCLP(tTotal + t.discountTotal)}</span>
          </div>
        )}
        {t.discountTotal > 0 && (
          <div className="flex items-baseline justify-between gap-6 text-sm text-[#C7E0C7]">
            <span>
              Descuento multi-tatuaje ({discount.multiTattooPct}%)
            </span>
            <span className="font-display">−{formatCLP(t.discountTotal)}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-6 pt-2 border-t border-bg/20">
          <span className="eyebrow !text-bg/60">Total</span>
          <span className="font-display text-4xl">{formatCLP(tTotal)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-6 pt-2 border-t border-bg/20">
          <span className="text-bg/70 text-sm">
            Abono para reservar{" "}
            {payment.depositMode === "PERCENTAGE"
              ? `(${payment.depositValue}% del total)`
              : "(monto fijo)"}
          </span>
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
