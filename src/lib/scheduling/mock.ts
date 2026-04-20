/**
 * Mock availability — Fase 1.
 * L–V 10:00 a 16:00. Bloquea aleatoriamente algunos slots para simular ocupación.
 * En Fase 2 esto consulta Booking + ScheduleBlock + HourMatrix.
 */
import { addDays, format, isWeekend, startOfWeek } from "date-fns";

export type DaySlot = {
  date: string; // YYYY-MM-DD
  label: string;
  slots: Array<{ startTime: string; available: boolean }>;
};

const STUDIO_OPEN = 10; // 10:00
const STUDIO_CLOSE = 16; // 16:00 (último start permitido depende de duración)

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function getAvailability(fromDate: Date, weeksAhead = 4, requiredHours = 1): DaySlot[] {
  const days: DaySlot[] = [];
  const start = startOfWeek(fromDate, { weekStartsOn: 1 });
  for (let i = 0; i < weeksAhead * 7; i++) {
    const d = addDays(start, i);
    if (d < fromDate) continue;
    if (isWeekend(d)) continue;

    const iso = format(d, "yyyy-MM-dd");
    const slots: DaySlot["slots"] = [];
    const latestStart = STUDIO_CLOSE - Math.ceil(requiredHours);
    for (let h = STUDIO_OPEN; h <= latestStart; h++) {
      const time = `${String(h).padStart(2, "0")}:00`;
      const seed = hashStr(`${iso}-${time}`);
      const available = seed % 3 !== 0; // ~33% ocupado
      slots.push({ startTime: time, available });
    }
    days.push({
      date: iso,
      label: format(d, "EEE dd MMM"),
      slots
    });
  }
  return days;
}
