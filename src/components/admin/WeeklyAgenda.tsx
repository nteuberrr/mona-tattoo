"use client";

import * as React from "react";
import { addDays, addWeeks, format, parseISO, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SEED_BOOKINGS,
  statusColor,
  statusLabel,
  type Booking,
  type BookingStatus
} from "@/lib/mock-bookings";
import { BookingPanel, type BookingAction } from "./BookingPanel";

const HOUR_START = 10;
const HOUR_END = 16; // last column header
const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
const ROW_HEIGHT = 64; // px per hour
const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie"];

function timeToOffset(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return ((h - HOUR_START) * 60 + (m ?? 0)) * (ROW_HEIGHT / 60);
}

export function WeeklyAgenda() {
  const [bookings, setBookings] = React.useState<Booking[]>(SEED_BOOKINGS);
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [showCancelled, setShowCancelled] = React.useState(false);
  const [selected, setSelected] = React.useState<Booking | null>(null);

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
  const weekLabel = `${format(weekStart, "dd MMM")} – ${format(addDays(weekStart, 4), "dd MMM yyyy")}`;

  const visibleBookings = React.useMemo(() => {
    const weekEnd = addDays(weekStart, 5);
    return bookings.filter((b) => {
      const d = parseISO(b.date);
      if (d < weekStart || d >= weekEnd) return false;
      if (!showCancelled && (b.status === "REJECTED" || b.status === "CANCELLED")) return false;
      return true;
    });
  }, [bookings, weekStart, showCancelled]);

  const pending = bookings.filter((b) => b.status === "PENDING_CONFIRMATION");

  const handleAction = (id: string, action: BookingAction, payload?: { reason?: string }) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        switch (action) {
          case "confirm":
            return { ...b, status: "CONFIRMED" as BookingStatus, depositPaid: true, confirmedAt: new Date().toISOString() };
          case "reject":
            return { ...b, status: "REJECTED" as BookingStatus, rejectionReason: payload?.reason };
          case "mark_completed":
            return { ...b, status: "COMPLETED" as BookingStatus };
          case "cancel":
            return { ...b, status: "CANCELLED" as BookingStatus };
          case "request_more_info":
            // No cambia estado — solo dispara correo (Fase 2b)
            return b;
          case "reschedule":
            return b; // TODO: abrir modal de reagendar (Fase 2)
          default:
            return b;
        }
      })
    );
    if (action !== "request_more_info" && action !== "reschedule") setSelected(null);
  };

  const openBooking = (b: Booking) => setSelected(b);

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="bg-[#F6E6C4] text-[#6B5217] border border-[#D9B860] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-medium">
                {pending.length} reserva{pending.length === 1 ? "" : "s"} pendiente{pending.length === 1 ? "" : "s"} de confirmar
              </div>
              <div className="mt-3 space-y-2">
                {pending.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openBooking(p)}
                    className="w-full text-left flex items-center justify-between gap-3 px-3 py-2 bg-bg/40 hover:bg-bg/70 transition-colors"
                  >
                    <span className="text-sm font-medium truncate">{p.client.name}</span>
                    <span className="text-xs whitespace-nowrap">
                      {format(parseISO(p.date), "dd/MM")} · {p.startTime}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset((o) => o - 1)} aria-label="Semana anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-display text-lg min-w-[180px] text-center capitalize">
            {weekLabel}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset((o) => o + 1)} aria-label="Semana siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
              Hoy
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCancelled((v) => !v)}
            className="text-xs"
          >
            {showCancelled ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showCancelled ? "Ocultar canceladas" : "Ver canceladas"}
          </Button>
          <Button size="sm" disabled title="Disponible en Fase 2b">
            <Plus className="h-4 w-4" /> Crear cita manual
          </Button>
        </div>
      </div>

      <Legend />

      {/* Vista grid desktop */}
      <div className="hidden md:block border border-line bg-surface overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header de días */}
          <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-line">
            <div className="p-3" />
            {weekDays.map((d, i) => {
              const isToday = format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              return (
                <div
                  key={i}
                  className={cn(
                    "p-3 text-center border-l border-line",
                    isToday && "bg-ink/5"
                  )}
                >
                  <div className="text-[0.65rem] uppercase tracking-editorial text-muted">
                    {DAY_LABELS[i]}
                  </div>
                  <div className={cn("font-display text-2xl mt-0.5", isToday && "text-ink")}>
                    {format(d, "dd")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid de horas */}
          <div className="relative grid grid-cols-[60px_repeat(5,1fr)]">
            {/* Columna de horas */}
            <div>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="border-b border-line text-[0.65rem] text-muted text-right pr-2 pt-1"
                  style={{ height: ROW_HEIGHT }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Columnas de días */}
            {weekDays.map((d, i) => {
              const dayStr = format(d, "yyyy-MM-dd");
              const dayBookings = visibleBookings.filter((b) => b.date === dayStr);
              return (
                <div key={i} className="relative border-l border-line">
                  {HOURS.map((h) => (
                    <div key={h} className="border-b border-line" style={{ height: ROW_HEIGHT }} />
                  ))}
                  {dayBookings.map((b) => {
                    const top = timeToOffset(b.startTime);
                    const height = b.totalHours * ROW_HEIGHT;
                    const c = statusColor(b.status);
                    return (
                      <button
                        key={b.id}
                        onClick={() => openBooking(b)}
                        className={cn(
                          "absolute left-1 right-1 px-2 py-1.5 text-left border-l-4 overflow-hidden",
                          "hover:opacity-90 transition-opacity cursor-pointer",
                          c.bg,
                          c.text,
                          c.border
                        )}
                        style={{ top, height: Math.max(height, 32) }}
                      >
                        <div className="text-[0.65rem] font-medium truncate">{b.startTime}</div>
                        <div className="text-xs font-medium truncate">{b.client.name}</div>
                        <div className="text-[0.65rem] truncate opacity-80">
                          {b.tattoos.length} tat · {b.totalHours}h
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vista lista mobile */}
      <div className="md:hidden space-y-4">
        {weekDays.map((d, i) => {
          const dayStr = format(d, "yyyy-MM-dd");
          const dayBookings = visibleBookings.filter((b) => b.date === dayStr);
          if (dayBookings.length === 0) return null;
          return (
            <div key={i} className="border border-line bg-surface">
              <div className="p-3 border-b border-line bg-ink/5">
                <div className="text-[0.65rem] uppercase tracking-editorial text-muted">
                  {DAY_LABELS[i]}
                </div>
                <div className="font-display text-xl">{format(d, "dd MMM")}</div>
              </div>
              <div className="divide-y divide-line">
                {dayBookings.map((b) => {
                  const c = statusColor(b.status);
                  return (
                    <button
                      key={b.id}
                      onClick={() => openBooking(b)}
                      className="w-full text-left p-4 hover:bg-line/30 transition-colors flex items-center gap-3"
                    >
                      <div className={cn("w-1 self-stretch", c.border, "border-l-4")} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted">{b.startTime} – {b.endTime}</div>
                        <div className="font-medium truncate">{b.client.name}</div>
                        <div className="text-xs text-ink-soft">
                          {b.tattoos.length} tatuaje{b.tattoos.length === 1 ? "" : "s"} · {b.totalHours}h
                        </div>
                      </div>
                      <Badge className={cn(c.bg, c.text, "border-0")}>
                        {statusLabel(b.status)}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {visibleBookings.length === 0 && (
          <div className="border border-line bg-surface p-10 text-center text-muted text-sm">
            Sin reservas esta semana.
          </div>
        )}
      </div>

      <BookingPanel booking={selected} onClose={() => setSelected(null)} onAction={handleAction} />
    </div>
  );
}

function Legend() {
  const items: { status: BookingStatus; label: string }[] = [
    { status: "QUOTED", label: "Cotizada" },
    { status: "PENDING_CONFIRMATION", label: "Pend. confirmar" },
    { status: "CONFIRMED", label: "Confirmada" },
    { status: "COMPLETED", label: "Completada" }
  ];
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
      <span className="uppercase tracking-editorial">Leyenda:</span>
      {items.map((it) => {
        const c = statusColor(it.status);
        return (
          <span key={it.status} className="inline-flex items-center gap-1.5">
            <span className={cn("h-3 w-3 border-l-4", c.bg, c.border)} />
            {it.label}
          </span>
        );
      })}
    </div>
  );
}
