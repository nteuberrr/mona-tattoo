"use client";

import * as React from "react";
import { useBooking } from "./BookingContext";
import { Button } from "@/components/ui/button";
import { getAvailability, type DaySlot } from "@/lib/scheduling/mock";
import { totals } from "@/lib/pricing/calculator";
import { cn } from "@/lib/utils";
import { SpecialScheduleModal } from "./SpecialScheduleModal";
import { CalendarClock } from "lucide-react";

export function Step3Schedule() {
  const { tattoos, schedule, dispatch, pricing, hours } = useBooking();
  const { hours: hoursNeeded } = totals(tattoos, { pricing, hours });
  const [days, setDays] = React.useState<DaySlot[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(schedule?.date ?? null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(schedule?.startTime ?? null);
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    setDays(getAvailability(new Date(), 4, hoursNeeded));
  }, [hoursNeeded]);

  const activeDay = days.find((d) => d.date === selectedDate) ?? days[0];

  React.useEffect(() => {
    if (!selectedDate && days[0]) setSelectedDate(days[0].date);
  }, [days, selectedDate]);

  const submit = () => {
    if (!selectedDate || !selectedTime) return;
    dispatch({
      type: "setSchedule",
      data: { date: selectedDate, startTime: selectedTime }
    });
  };

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h2 className="display-md">Elige tu horario</h2>
        <p className="mt-3 text-ink-soft">
          Tu sesión necesita{" "}
          <span className="text-ink font-medium">{hoursNeeded} horas</span>{" "}
          aproximadamente. Muestro solo slots disponibles L–V 10:00 a 16:00.
        </p>
      </div>

      <div className="border border-line bg-surface">
        <div className="flex overflow-x-auto border-b border-line">
          {days.map((d) => (
            <button
              key={d.date}
              onClick={() => {
                setSelectedDate(d.date);
                setSelectedTime(null);
              }}
              className={cn(
                "flex-1 min-w-[110px] px-4 py-4 text-left transition-colors",
                "border-r border-line last:border-r-0",
                selectedDate === d.date ? "bg-ink text-bg" : "hover:bg-line/30"
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
              Sin slots que encajen con {hoursNeeded} h este día.
            </p>
          )}
          {activeDay?.slots.map((s) => (
            <button
              key={s.startTime}
              disabled={!s.available}
              onClick={() => setSelectedTime(s.startTime)}
              className={cn(
                "h-11 border text-sm font-body transition-colors",
                !s.available && "border-line text-muted line-through cursor-not-allowed",
                s.available &&
                  selectedTime === s.startTime
                  ? "border-ink bg-ink text-bg"
                  : s.available && "border-line hover:border-ink"
              )}
            >
              {s.startTime}
            </button>
          ))}
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
        <Button onClick={submit} disabled={!selectedDate || !selectedTime}>
          Continuar →
        </Button>
      </div>

      <SpecialScheduleModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
