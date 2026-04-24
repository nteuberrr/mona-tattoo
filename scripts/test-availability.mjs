/**
 * Tests del sistema de disponibilidad de la agenda.
 * Corre: node scripts/test-availability.mjs
 *
 * Cubre:
 *   - Slots básicos (día vacío, día con reservas)
 *   - Reservas multi-bloque (additionalBlocks en notas_admin)
 *   - Estados que bloquean vs no bloquean (CONFIRMED/QUOTED expirado/etc)
 *   - Bloqueos manuales (allDay y por franja)
 *   - Horarios custom por día (sábado abierto, lunes cerrado, etc)
 *   - Default L-V 10-16 cuando config vacía
 *   - Conflict check (isSlotAvailable)
 */

// ===== Replica de la lógica pura desde src/lib/scheduling/availability.ts =====
// (Replicada en JS porque .mjs no resuelve TypeScript)

const WEEKDAY_KEYS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const DAY_LABELS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DEFAULT_DAY_SCHEDULE = {
  domingo: "off",
  lunes: "10:00-16:00",
  martes: "10:00-16:00",
  miercoles: "10:00-16:00",
  jueves: "10:00-16:00",
  viernes: "10:00-16:00",
  sabado: "off"
};
const BLOCKING_STATUSES = ["CONFIRMED", "COMPLETED", "PENDING_CONFIRMATION", "RESCHEDULED"];

function timeToMin(t) {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function minToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function rangesOverlap(a, b) {
  return timeToMin(a.start) < timeToMin(b.end) && timeToMin(a.end) > timeToMin(b.start);
}
function parseDaySchedule(value) {
  if (!value || value === "off") return null;
  const m = value.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (!m) return null;
  return { start: m[1], end: m[2] };
}
function parseAdditionalBlocks(notes) {
  if (!notes) return [];
  const m = notes.match(/\[BLOCKS\]:\s*(\[.*?\])/s);
  if (!m) return [];
  try {
    const arr = JSON.parse(m[1]);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function isQuotedHoldActive(b) {
  if (b.status !== "QUOTED") return false;
  if (!b.createdAt) return false;
  return Date.now() < new Date(b.createdAt).getTime() + 30 * 60 * 1000;
}
function buildScheduleSnapshot({ bookings, blocks, config, fromDate, daysAhead }) {
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const weekday = d.getDay();
    const dayKey = WEEKDAY_KEYS[weekday];
    const label = `${DAY_LABELS_SHORT[weekday]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
    const configured = config[`horario_${dayKey}`];
    const open = parseDaySchedule(
      configured && String(configured).trim() ? String(configured) : DEFAULT_DAY_SCHEDULE[dayKey]
    );
    const taken = [];
    for (const b of bookings) {
      const blocking = BLOCKING_STATUSES.includes(b.status) || isQuotedHoldActive(b);
      if (!blocking) continue;
      if (b.date === iso && b.startTime && b.endTime) {
        taken.push({ start: b.startTime, end: b.endTime });
      }
      const extras = parseAdditionalBlocks(b.notes);
      for (const x of extras) {
        if (x.date !== iso) continue;
        const startMin = timeToMin(x.startTime);
        const endMin = startMin + (x.hours || 3) * 60;
        taken.push({ start: x.startTime, end: minToTime(endMin) });
      }
    }
    for (const blk of blocks) {
      if (blk.date !== iso) continue;
      if (blk.allDay) {
        if (open) taken.push({ start: open.start, end: open.end });
      } else if (blk.startTime && blk.endTime) {
        taken.push({ start: blk.startTime, end: blk.endTime });
      }
    }
    days.push({ date: iso, weekday, label, open, taken });
  }
  return days;
}
function getSlotsForDay(day, hoursPerBlock) {
  if (!day.open || hoursPerBlock <= 0) return [];
  const slots = [];
  const openStart = timeToMin(day.open.start);
  const openEnd = timeToMin(day.open.end);
  const blockMin = Math.ceil(hoursPerBlock * 60);
  for (let t = openStart; t + blockMin <= openEnd; t += 60) {
    const slot = { start: minToTime(t), end: minToTime(t + blockMin) };
    const conflict = day.taken.some((tk) => rangesOverlap(slot, tk));
    slots.push({ startTime: slot.start, available: !conflict });
  }
  return slots;
}
function isSlotAvailable(snapshot, date, startTime, hours) {
  const day = snapshot.find((d) => d.date === date);
  if (!day || !day.open) return false;
  const slot = { start: startTime, end: minToTime(timeToMin(startTime) + Math.ceil(hours * 60)) };
  if (timeToMin(slot.start) < timeToMin(day.open.start)) return false;
  if (timeToMin(slot.end) > timeToMin(day.open.end)) return false;
  return !day.taken.some((tk) => rangesOverlap(slot, tk));
}

// ===== Test framework =====
let passed = 0;
let failed = 0;
function expect(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    console.log(`    esperado: ${JSON.stringify(expected)}`);
    console.log(`    actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}
function section(title) {
  console.log(`\n━ ${title}`);
}

// =========================================================
section("1. Slots básicos");
{
  const day = { date: "2026-04-22", weekday: 3, label: "Mié 22 abr", open: { start: "10:00", end: "16:00" }, taken: [] };
  expect("día vacío L-V 10-16, slot 1h: 6 slots", getSlotsForDay(day, 1).length, 6);
  expect("todos disponibles", getSlotsForDay(day, 1).every((s) => s.available), true);
}

// =========================================================
section("2. Reserva existente bloquea overlap");
{
  const day = { date: "2026-04-22", weekday: 3, label: "Mié 22 abr", open: { start: "10:00", end: "16:00" }, taken: [{ start: "11:00", end: "13:00" }] };
  const m = Object.fromEntries(getSlotsForDay(day, 1).map((s) => [s.startTime, s.available]));
  expect("10:00 disponible", m["10:00"], true);
  expect("11:00 BLOQUEADO", m["11:00"], false);
  expect("12:00 BLOQUEADO", m["12:00"], false);
  expect("13:00 disponible (justo termina la otra)", m["13:00"], true);
  expect("14:00 disponible", m["14:00"], true);
  expect("15:00 disponible", m["15:00"], true);
}

// =========================================================
section("3. Slot 3h con reserva intermedia");
{
  const day = { date: "2026-04-22", weekday: 3, label: "Mié 22 abr", open: { start: "10:00", end: "16:00" }, taken: [{ start: "12:00", end: "13:00" }] };
  const m = Object.fromEntries(getSlotsForDay(day, 3).map((s) => [s.startTime, s.available]));
  expect("3h start 10:00 BLOQUEADO", m["10:00"], false);
  expect("3h start 11:00 BLOQUEADO", m["11:00"], false);
  expect("3h start 12:00 BLOQUEADO", m["12:00"], false);
  expect("3h start 13:00 disponible (entra 13-16)", m["13:00"], true);
}

// =========================================================
section("4. 5.5h NO puede agendarse encima de otra (caso reportado)");
{
  const snapshot = [
    { date: "2026-04-22", weekday: 3, label: "Mié 22 abr", open: { start: "10:00", end: "16:00" }, taken: [{ start: "11:00", end: "13:00" }] },
    { date: "2026-04-23", weekday: 4, label: "Jue 23 abr", open: { start: "10:00", end: "16:00" }, taken: [] }
  ];
  expect("bloque 11:00 sobre reserva 11-13 RECHAZADO", isSlotAvailable(snapshot, "2026-04-22", "11:00", 3), false);
  expect("bloque 11:00 día libre ACEPTADO", isSlotAvailable(snapshot, "2026-04-23", "11:00", 3), true);
  expect("13:00 justo cuando termina la otra OK", isSlotAvailable(snapshot, "2026-04-22", "13:00", 3), true);
}

// =========================================================
section("5. Múltiples reservas dispersas");
{
  const day = {
    date: "2026-04-22",
    weekday: 3,
    label: "Mié 22 abr",
    open: { start: "10:00", end: "16:00" },
    taken: [{ start: "10:00", end: "11:00" }, { start: "13:00", end: "14:00" }]
  };
  const m = Object.fromEntries(getSlotsForDay(day, 1).map((s) => [s.startTime, s.available]));
  expect("10:00 BLOQUEADO", m["10:00"], false);
  expect("11:00 disponible", m["11:00"], true);
  expect("12:00 disponible", m["12:00"], true);
  expect("13:00 BLOQUEADO", m["13:00"], false);
  expect("14:00 disponible", m["14:00"], true);
  expect("15:00 disponible", m["15:00"], true);
}

// =========================================================
section("6. Día cerrado / horario custom");
{
  const closed = { date: "2026-04-26", weekday: 0, open: null, taken: [] };
  expect("día cerrado: 0 slots", getSlotsForDay(closed, 1).length, 0);

  const sat = { date: "2026-04-25", weekday: 6, open: { start: "11:00", end: "15:00" }, taken: [] };
  expect("sábado 11-15: 4 slots de 1h", getSlotsForDay(sat, 1).length, 4);
  expect("primer slot 11:00", getSlotsForDay(sat, 1)[0].startTime, "11:00");
}

// =========================================================
section("7. Slot que excede cierre");
{
  const day = { date: "2026-04-22", weekday: 3, open: { start: "10:00", end: "16:00" }, taken: [] };
  const slots3h = getSlotsForDay(day, 3);
  expect("3h: 4 candidatos (10,11,12,13)", slots3h.length, 4);
  expect("último start 13:00 (13+3=16)", slots3h.at(-1).startTime, "13:00");
  expect("isSlotAvailable rechaza 14:00 + 3h", isSlotAvailable([day], "2026-04-22", "14:00", 3), false);
}

// =========================================================
section("8. Estados: solo activos bloquean");
{
  const baseBooking = (status, extra = {}) => ({
    id: "bk1",
    date: "2026-04-22",
    startTime: "11:00",
    endTime: "13:00",
    status,
    notes: undefined,
    createdAt: new Date().toISOString(),
    ...extra
  });

  const config = {};
  const blocks = [];
  const fromDate = new Date(2026, 3, 22);

  for (const status of ["CONFIRMED", "PENDING_CONFIRMATION", "COMPLETED", "RESCHEDULED"]) {
    const snapshot = buildScheduleSnapshot({
      bookings: [baseBooking(status)],
      blocks,
      config,
      fromDate,
      daysAhead: 1
    });
    expect(`status ${status} BLOQUEA`, snapshot[0].taken.length, 1);
  }

  for (const status of ["REJECTED", "CANCELLED"]) {
    const snapshot = buildScheduleSnapshot({
      bookings: [baseBooking(status)],
      blocks,
      config,
      fromDate,
      daysAhead: 1
    });
    expect(`status ${status} NO bloquea`, snapshot[0].taken.length, 0);
  }
}

// =========================================================
section("9. QUOTED: hold activo bloquea, hold expirado no");
{
  const fromDate = new Date(2026, 3, 22);
  const recent = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // hace 5 min
  const old = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // hace 1h

  const snapActive = buildScheduleSnapshot({
    bookings: [{ id: "1", date: "2026-04-22", startTime: "11:00", endTime: "13:00", status: "QUOTED", createdAt: recent, notes: "" }],
    blocks: [], config: {}, fromDate, daysAhead: 1
  });
  expect("QUOTED hold activo BLOQUEA", snapActive[0].taken.length, 1);

  const snapExpired = buildScheduleSnapshot({
    bookings: [{ id: "2", date: "2026-04-22", startTime: "11:00", endTime: "13:00", status: "QUOTED", createdAt: old, notes: "" }],
    blocks: [], config: {}, fromDate, daysAhead: 1
  });
  expect("QUOTED hold expirado (1h) NO bloquea", snapExpired[0].taken.length, 0);
}

// =========================================================
section("10. Bloqueos manuales (vacaciones / franja)");
{
  const fromDate = new Date(2026, 3, 22);

  // Día completo bloqueado
  const snapAllDay = buildScheduleSnapshot({
    bookings: [],
    blocks: [{ id: "blk1", date: "2026-04-22", allDay: true, reason: "Feriado" }],
    config: {}, fromDate, daysAhead: 1
  });
  // En un día bloqueado allDay, taken cubre el horario completo
  expect("allDay block: 0 slots disponibles", getSlotsForDay(snapAllDay[0], 1).filter((s) => s.available).length, 0);

  // Franja específica bloqueada
  const snapRange = buildScheduleSnapshot({
    bookings: [],
    blocks: [{ id: "blk2", date: "2026-04-22", startTime: "12:00", endTime: "14:00", allDay: false, reason: "Almuerzo" }],
    config: {}, fromDate, daysAhead: 1
  });
  const m = Object.fromEntries(getSlotsForDay(snapRange[0], 1).map((s) => [s.startTime, s.available]));
  expect("11:00 OK (antes del bloqueo)", m["11:00"], true);
  expect("12:00 BLOQUEADO", m["12:00"], false);
  expect("13:00 BLOQUEADO", m["13:00"], false);
  expect("14:00 OK (justo termina el bloqueo)", m["14:00"], true);
}

// =========================================================
section("11. Multi-bloque: additionalBlocks en notas también bloquean");
{
  const fromDate = new Date(2026, 3, 22);
  const booking = {
    id: "bk1",
    status: "CONFIRMED",
    date: "2026-04-22",
    startTime: "10:00",
    endTime: "13:00",
    createdAt: new Date().toISOString(),
    notes: '[BLOCKS]: [{"date":"2026-04-23","startTime":"11:00","hours":3}]'
  };
  const snapshot = buildScheduleSnapshot({
    bookings: [booking],
    blocks: [],
    config: {},
    fromDate,
    daysAhead: 2
  });
  // Día 1: bloque principal 10-13
  expect("día 1 taken: 10-13", snapshot[0].taken, [{ start: "10:00", end: "13:00" }]);
  // Día 2: bloque adicional 11-14 desde notas
  expect("día 2 taken: bloque adicional 11-14", snapshot[1].taken, [{ start: "11:00", end: "14:00" }]);
  // Slot 11:00 del día 2 debe estar bloqueado
  const m2 = Object.fromEntries(getSlotsForDay(snapshot[1], 1).map((s) => [s.startTime, s.available]));
  expect("día 2 slot 11:00 BLOQUEADO por bloque adicional", m2["11:00"], false);
}

// =========================================================
section("12. Defaults: si no hay config, usa L-V 10-16");
{
  const fromDate = new Date(2026, 3, 20); // lunes
  const snapshot = buildScheduleSnapshot({
    bookings: [],
    blocks: [],
    config: {}, // sin horario_lunes etc
    fromDate,
    daysAhead: 7
  });
  expect("Lunes abierto (default)", snapshot[0].open, { start: "10:00", end: "16:00" });
  expect("Sábado cerrado (default)", snapshot[5].open, null);
  expect("Domingo cerrado (default)", snapshot[6].open, null);
}

// =========================================================
section("13. Config override");
{
  const fromDate = new Date(2026, 3, 20); // lunes
  const config = {
    horario_lunes: "11:00-19:00",
    horario_sabado: "10:00-14:00"
  };
  const snapshot = buildScheduleSnapshot({ bookings: [], blocks: [], config, fromDate, daysAhead: 7 });
  expect("Lunes override 11-19", snapshot[0].open, { start: "11:00", end: "19:00" });
  expect("Sábado override 10-14", snapshot[5].open, { start: "10:00", end: "14:00" });
  expect("Domingo sigue default cerrado", snapshot[6].open, null);
}

// =========================================================
section("14. Config explícita 'off' cierra día");
{
  const fromDate = new Date(2026, 3, 20); // lunes
  const snapshot = buildScheduleSnapshot({
    bookings: [], blocks: [],
    config: { horario_lunes: "off" },
    fromDate, daysAhead: 1
  });
  expect("Lunes 'off' cerrado", snapshot[0].open, null);
}

// =========================================================
section("15. Empieza/termina exactamente en límite no es overlap");
{
  const day = { date: "2026-04-22", weekday: 3, open: { start: "10:00", end: "16:00" }, taken: [{ start: "11:00", end: "13:00" }] };
  // Slot 13:00-14:00 empieza exactamente cuando la otra termina → DEBE estar disponible
  expect("13:00 a 14:00 OK justo después de 11-13", getSlotsForDay(day, 1).find((s) => s.startTime === "13:00").available, true);
  // Slot 10:00-11:00 termina exactamente cuando empieza la otra → DEBE estar disponible
  expect("10:00 a 11:00 OK justo antes de 11-13", getSlotsForDay(day, 1).find((s) => s.startTime === "10:00").available, true);
}

// =========================================================
section("16. isSlotAvailable: escenarios de booking creation");
{
  const snapshot = [{
    date: "2026-04-22",
    weekday: 3,
    open: { start: "10:00", end: "16:00" },
    taken: [{ start: "11:00", end: "13:00" }, { start: "14:00", end: "15:00" }]
  }];
  expect("nueva 10:00 + 1h OK", isSlotAvailable(snapshot, "2026-04-22", "10:00", 1), true);
  expect("nueva 11:00 + 1h CHOCA", isSlotAvailable(snapshot, "2026-04-22", "11:00", 1), false);
  expect("nueva 13:00 + 2h CHOCA con 14-15", isSlotAvailable(snapshot, "2026-04-22", "13:00", 2), false);
  expect("nueva 09:00 + 1h fuera de horario RECHAZA", isSlotAvailable(snapshot, "2026-04-22", "09:00", 1), false);
  expect("nueva 15:00 + 2h fuera de cierre RECHAZA", isSlotAvailable(snapshot, "2026-04-22", "15:00", 2), false);
  expect("día inexistente RECHAZA", isSlotAvailable(snapshot, "2026-04-23", "10:00", 1), false);
}

// =========================================================
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
