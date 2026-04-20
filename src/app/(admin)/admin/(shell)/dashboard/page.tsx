"use client";

import Link from "next/link";
import { addDays, endOfMonth, format, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SEED_BOOKINGS,
  statusColor,
  statusLabel,
  type Booking
} from "@/lib/mock-bookings";
import { formatCLP, cn, formatDateLong } from "@/lib/utils";

export default function DashboardPage() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 5);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const all = SEED_BOOKINGS;
  const pending = all.filter((b) => b.status === "PENDING_CONFIRMATION");

  const reservasSemana = all.filter((b) => {
    const d = parseISO(b.date);
    return d >= weekStart && d < weekEnd && b.status === "CONFIRMED";
  });

  const ingresosMes = all
    .filter((b) => {
      const d = parseISO(b.date);
      return d >= monthStart && d <= monthEnd && (b.status === "CONFIRMED" || b.status === "COMPLETED");
    })
    .reduce((acc, b) => acc + b.totalPrice, 0);

  const proximas = all
    .filter((b) => b.status === "CONFIRMED" && parseISO(b.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 5);

  const proximaCita = proximas[0];

  const kpis = [
    {
      label: "Reservas esta semana",
      value: String(reservasSemana.length),
      hint: reservasSemana.length > 0 ? "confirmadas" : "— sin reservas"
    },
    {
      label: "Ingresos del mes",
      value: ingresosMes > 0 ? formatCLP(ingresosMes) : "—",
      hint: "confirmadas + completadas"
    },
    {
      label: "Próxima cita",
      value: proximaCita ? format(parseISO(proximaCita.date), "dd MMM") : "—",
      hint: proximaCita ? `${proximaCita.client.name} · ${proximaCita.startTime}` : "sin próximas"
    },
    {
      label: "Pendientes de confirmar",
      value: String(pending.length),
      hint: pending.length > 0 ? "requieren acción" : "al día ✦"
    }
  ];

  return (
    <div className="space-y-10 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">Panel</span>
          <h1 className="display-md mt-1">Dashboard</h1>
        </div>
        <Badge variant="outline">Fase 2a · data mock</Badge>
      </div>

      {pending.length > 0 && (
        <div className="bg-[#F6E6C4] text-[#6B5217] border border-[#D9B860] p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm">
              Tienes <strong>{pending.length}</strong> reserva
              {pending.length === 1 ? "" : "s"} pendiente
              {pending.length === 1 ? "" : "s"} de confirmar.
            </span>
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link href="/admin/agenda">Ver en agenda →</Link>
          </Button>
        </div>
      )}

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="border border-line bg-surface p-5">
            <div className="text-xs uppercase tracking-editorial text-muted">{k.label}</div>
            <div className="font-display text-3xl mt-2">{k.value}</div>
            <div className="text-xs text-muted mt-1">{k.hint}</div>
          </div>
        ))}
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <ProximasCitas citas={proximas} />
        <Config />
      </section>
    </div>
  );
}

function ProximasCitas({ citas }: { citas: Booking[] }) {
  return (
    <div className="border border-line bg-surface p-6">
      <h2 className="font-display text-2xl">Próximas citas</h2>
      <p className="text-xs text-muted mt-1">Confirmadas, ordenadas por fecha</p>
      <div className="mt-5 space-y-3">
        {citas.length === 0 && (
          <p className="text-sm text-muted py-6 text-center">Sin citas próximas.</p>
        )}
        {citas.map((b) => {
          const c = statusColor(b.status);
          return (
            <Link
              key={b.id}
              href={`/admin/citas/${b.id}`}
              className="flex items-center gap-3 hover:bg-line/30 -mx-3 px-3 py-2 transition-colors"
            >
              <div className={cn("w-1 h-10 border-l-4", c.border)} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{b.client.name}</div>
                <div className="text-xs text-muted capitalize">
                  {formatDateLong(b.date)} · {b.startTime}
                </div>
              </div>
              <div className="text-sm font-display">{formatCLP(b.totalPrice)}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Config() {
  return (
    <div className="border border-line bg-surface p-6">
      <h2 className="font-display text-2xl">Empieza por acá</h2>
      <p className="text-sm text-ink-soft mt-2">
        Antes de recibir reservas reales, carga tu tabla de precios y la
        matriz de horas. Alimentan la cotización y el cálculo de slots del
        flujo público.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/configuracion/precios">Subir precios</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/admin/configuracion/horas">Matriz de horas</Link>
        </Button>
      </div>
    </div>
  );
}
