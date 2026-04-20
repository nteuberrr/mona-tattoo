/**
 * Calculo de disponibilidad real basado en:
 *  - Reservas existentes en el Sheet (las que bloquean: CONFIRMED, COMPLETED,
 *    PENDING_CONFIRMATION, RESCHEDULED, y QUOTED si hold no expiró).
 *  - Bloqueos de agenda (Bloqueos_Agenda).
 *  - Configuración de horarios por día (horario_lunes…domingo).
 *
 * Devuelve un snapshot por día con: rango abierto + intervalos ocupados.
 * El cliente computa los slots concretos para una duración X consultando
 * `getSlotsForDay(day, hoursPerBlock)`.
 */

import { addDays, format, parseISO, startOfDay } from "date-fns";
import type { Booking, BookingStatus } from "@/lib/mock-bookings";
import type { ConfigMap } from "@/lib/config/sheets";
import type { ScheduleBlock } from "@/lib/blocks/sheets";

export type TimeRange = { start: string; end: string };

export type DaySchedule = {
  date: string; // YYYY-MM-DD
  weekday: number; // 0=domingo..6=sábado
  label: string; // ej. "Mar 22 abr"
  open: TimeRange | null; // null si día cerrado
  taken: TimeRange[]; // intervalos ocupados (bookings + blocks)
};

const WEEKDAY_KEYS = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado"
] as const;

const DAY_LABELS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const BLOCKING_STATUSES: BookingStatus[] = [
  "CONFIRMED",
  "COMPLETED",
  "PENDING_CONFIRMATION",
  "RESCHEDULED"
];

// Hold de slots QUOTED: 30 minutos por defecto. Si el booking no tiene
// slot_hold_hasta o ya pasó, no bloquea.
function isQuotedHoldActive(b: Booking): boolean {
  if (b.status !== "QUOTED") return false;
  // Asumimos que createdAt es la base del hold (30 min). El campo real
  // slot_hold_hasta no está en el tipo Booking actual.
  if (!b.createdAt) return false;
  const created = new Date(b.createdAt).getTime();
  const expiresAt = created + 30 * 60 * 1000;
  return Date.now() < expiresAt;
}

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return timeToMin(a.start) < timeToMin(b.end) && timeToMin(a.end) > timeToMin(b.start);
}

function parseDaySchedule(value: string | undefined): TimeRange | null {
  if (!value || value === "off") return null;
  const m = value.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (!m) return null;
  return { start: m[1], end: m[2] };
}

/** Lee additionalBlocks que pudieron guardarse en notas_admin como JSON */
function parseAdditionalBlocks(notes: string | undefined): Array<{ date: string; startTime: string; hours: number }> {
  if (!notes) return [];
  const m = notes.match(/\[BLOCKS\]:\s*(\[.*?\])/s);
  if (!m) return [];
  try {
    const arr = JSON.parse(m[1]);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch {
    return [];
  }
}

export function buildScheduleSnapshot({
  bookings,
  blocks,
  config,
  fromDate,
  daysAhead
}: {
  bookings: Booking[];
  blocks: ScheduleBlock[];
  config: ConfigMap;
  fromDate: Date;
  daysAhead: number;
}): DaySchedule[] {
  const start = startOfDay(fromDate);
  const days: DaySchedule[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const d = addDays(start, i);
    const iso = format(d, "yyyy-MM-dd");
    const weekday = d.getDay();
    const label = `${DAY_LABELS_SHORT[weekday]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
    const open = parseDaySchedule(config[`horario_${WEEKDAY_KEYS[weekday]}`]);

    const taken: TimeRange[] = [];

    // Reservas en este día
    for (const b of bookings) {
      const blocking = BLOCKING_STATUSES.includes(b.status) || isQuotedHoldActive(b);
      if (!blocking) continue;
      if (b.date === iso && b.startTime && b.endTime) {
        taken.push({ start: b.startTime, end: b.endTime });
      }
      // Bloques adicionales del mismo booking (multi-block)
      const extras = parseAdditionalBlocks(b.notes);
      for (const x of extras) {
        if (x.date !== iso) continue;
        const startMin = timeToMin(x.startTime);
        const endMin = startMin + (x.hours || 3) * 60;
        taken.push({ start: x.startTime, end: minToTime(endMin) });
      }
    }

    // Bloqueos manuales (vacaciones, feriados)
    for (const blk of blocks) {
      if (blk.date !== iso) continue;
      if (blk.allDay) {
        // Día cerrado completo
        if (open) taken.push({ start: open.start, end: open.end });
      } else if (blk.startTime && blk.endTime) {
        taken.push({ start: blk.startTime, end: blk.endTime });
      }
    }

    days.push({ date: iso, weekday, label, open, taken });
  }

  return days;
}

/**
 * Para un día y duración requerida, retorna los slots horarios candidatos
 * con su disponibilidad. Slots cada 1 hora, comenzando desde open.start.
 */
export function getSlotsForDay(
  day: DaySchedule,
  hoursPerBlock: number
): Array<{ startTime: string; available: boolean }> {
  if (!day.open || hoursPerBlock <= 0) return [];
  const slots: Array<{ startTime: string; available: boolean }> = [];
  const openStart = timeToMin(day.open.start);
  const openEnd = timeToMin(day.open.end);
  const blockMin = Math.ceil(hoursPerBlock * 60);

  for (let t = openStart; t + blockMin <= openEnd; t += 60) {
    const slot: TimeRange = { start: minToTime(t), end: minToTime(t + blockMin) };
    const conflict = day.taken.some((tk) => rangesOverlap(slot, tk));
    slots.push({ startTime: slot.start, available: !conflict });
  }
  return slots;
}

/**
 * Verifica si una reserva nueva (date + startTime + hours) entra en conflicto
 * con la agenda actual. Usado en /api/reservas para evitar race conditions.
 */
export function isSlotAvailable(
  snapshot: DaySchedule[],
  date: string,
  startTime: string,
  hours: number
): boolean {
  const day = snapshot.find((d) => d.date === date);
  if (!day || !day.open) return false;
  const slot: TimeRange = {
    start: startTime,
    end: minToTime(timeToMin(startTime) + Math.ceil(hours * 60))
  };
  // Slot debe caber dentro del horario del día
  if (timeToMin(slot.start) < timeToMin(day.open.start)) return false;
  if (timeToMin(slot.end) > timeToMin(day.open.end)) return false;
  // Sin overlap con taken
  return !day.taken.some((tk) => rangesOverlap(slot, tk));
}
