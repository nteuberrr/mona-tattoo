"use client";

import * as React from "react";
import { useBooking } from "./BookingContext";
import { Button } from "@/components/ui/button";
import { getAvailability, type DaySlot } from "@/lib/scheduling/mock";
import { totals } from "@/lib/pricing/calculator";
import { cn, formatHours } from "@/lib/utils";
import { SpecialScheduleModal } from "./SpecialScheduleModal";
import { CalendarClock, AlertCircle, X } from "lucide-react";

const MAX_BLOCK_HOURS = 3;

type Slot = { date: string; startTime: string };

export function Step3Schedule() {
  const { tattoos, schedule, dispatch, pricing, hours } = useBooking();
  const { hours: totalHoursNeeded } = totals(tattoos, { pricing, hours });

  // Si la sesión supera 3h, se divide en bloques
  const needsMultipleBlocks = totalHoursNeeded > MAX_BLOCK_HOURS;
  const hoursPerBlock = needsMultipleBlocks ? MAX_BLOCK_HOURS : totalHoursNeeded;
  const blocksNeeded = needsMultipleBlocks ? Math.ceil(totalHoursNeeded / MAX_BLOCK_HOURS) : 1;

  const [days, setDays] = React.useState<DaySlot[]>([]);
  const [selectedSlots, setSelectedSlots] = React.useState<Slot[]>(
    schedule ? [{ date: schedule.date, startTime: schedule.startTime }] : []
  );
  const [activeDate, setActiveDate] = React.useState<string | null>(
    schedule?.date ?? null
  );
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    setDays(getAvailability(new Date(), 6, hoursPerBlock));
  }, [hoursPerBlock]);

  React.useEffect(() => {
    if (!activeDate && days[0]) setActiveDate(days[0].date);
  }, [days, activeDate]);

  const activeDay = days.find((d) => d.date === activeDate) ?? days[0];

  const isSelected = (date: string, time: string) =>
    selectedSlots.some((s) => s.date === date && s.startTime === time);

  const toggleSlot = (date: string, time: string) => {
    const already = isSelected(date, time);
    if (already) {
      setSelectedSlots((prev) => prev.filter((s) => !(s.date === date && s.startTime === time)));
      return;
    }
    if (!needsMultipleBlocks) {
      // Un solo slot: reemplaza el anterior
      setSelectedSlots([{ date, startTime: time }]);
    } else {
      if (selectedSlots.length >= blocksNeeded) return;
      setSelectedSlots((prev) => [...prev, { date, startTime: time }]);
    }
  };

  const submit = () => {
    if (selectedSlots.length === 0) return;
    // Ordenar por fecha + hora y tomar el primer slot como principal
    const sorted = [...selectedSlots].sort(
      (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
    );
    dispatch({
      type: "setSchedule",
      data: {
        date: sorted[0].date,
        startTime: sorted[0].startTime,
        additionalBlocks: sorted.slice(1)
      } as never
    });
  };

  const canContinue = selectedSlots.length === blocksNeeded;

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h2 className="display-md">Elige tu horario</h2>
        <p className="mt-3 text-ink-soft">
          Tu sesión necesita{" "}
          <span className="text-ink font-medium">{formatHours(totalHoursNeeded)}</span>{" "}
          aproximadamente. Muestro slots L–V 10:00 a 16:00.
        </p>
      </div>

      {needsMultipleBlocks && (
        <div className="bg-[#F6E6C4] text-[#6B5217] border border-[#D9B860] p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm">
              Trabajamos en sesiones de máximo 3 horas
            </div>
            <p className="text-xs mt-1">
              Necesitas <strong>{blocksNeeded}</strong> bloques de hasta 3h para cubrir las{" "}
              {formatHours(totalHoursNeeded)}. Selecciona los días y horas para cada bloque.
            </p>
          </div>
        </div>
      )}

      {selectedSlots.length > 0 && (
        <div className="border border-line bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="eyebrow">
              Bloques seleccionados ({selectedSlots.length}/{blocksNeeded})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSlots.map((s) => {
              const day = days.find((d) => d.date === s.date);
              return (
                <span
                  key={`${s.date}-${s.startTime}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-ink text-bg text-xs"
                >
                  <span className="capitalize">{day?.label ?? s.date}</span>
                  <span className="font-mono">{s.startTime}</span>
                  <button
                    onClick={() => toggleSlot(s.date, s.startTime)}
                    className="hover:opacity-70"
                    aria-label="Quitar bloque"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="border border-line bg-surface">
        <div className="flex overflow-x-auto border-b border-line">
          {days.map((d) => (
            <button
              key={d.date}
              onClick={() => setActiveDate(d.date)}
              className={cn(
                "flex-1 min-w-[110px] px-4 py-4 text-left transition-colors",
                "border-r border-line last:border-r-0",
                activeDate === d.date ? "bg-ink text-bg" : "hover:bg-line/30"
              )}
            >
              <div className="text-[0.65rem] uppercase tracking-editorial opacity-70 capitalize">
                {d.label.split(" ")[0]}
              </div>
              <div className="font-display text-2xl mt-1">
                {d.label.split(" ")[1]}
              </div>
              <div className="text-[0.65rem] uppercase tracking-editorial opacity-70 capitalize">
                {d.label.split(" ")[2]}
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {activeDay?.slots.length === 0 && (
            <p className="col-span-full text-sm text-muted text-center py-8">
              Sin slots que encajen con {formatHours(hoursPerBlock)} este día.
            </p>
          )}
          {activeDay?.slots.map((s) => {
            const selected = isSelected(activeDay.date, s.startTime);
            const full = !selected && selectedSlots.length >= blocksNeeded;
            return (
              <button
                key={s.startTime}
                disabled={!s.available || full}
                onClick={() => toggleSlot(activeDay.date, s.startTime)}
                className={cn(
                  "h-11 border text-sm font-body transition-colors",
                  !s.available && "border-line text-muted line-through cursor-not-allowed",
                  s.available && selected && "border-ink bg-ink text-bg",
                  s.available && !selected && !full && "border-line hover:border-ink",
                  s.available && !selected && full && "border-line text-muted cursor-not-allowed opacity-50"
                )}
              >
                {s.startTime}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink underline underline-offset-4"
      >
        <CalendarClock className="h-4 w-4" />
        No puedo, solicitar un horario especial
      </button>

      <div className="pt-4 flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" onClick={() => dispatch({ type: "goTo", step: 2 })}>
          ← Volver
        </Button>
        <Button onClick={submit} disabled={!canContinue}>
          Continuar →
        </Button>
      </div>

      <SpecialScheduleModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
