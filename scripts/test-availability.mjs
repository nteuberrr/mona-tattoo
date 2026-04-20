/**
 * Test del cálculo de disponibilidad. Corre:
 *   node scripts/test-availability.mjs
 *
 * Reproduce el caso del usuario: una reserva existente de 2h debe bloquear
 * que entre otra encima.
 */

// Replicamos las funciones puras (sin imports de lib porque .mjs no resuelve TS)

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
  const slot = {
    start: startTime,
    end: minToTime(timeToMin(startTime) + Math.ceil(hours * 60))
  };
  if (timeToMin(slot.start) < timeToMin(day.open.start)) return false;
  if (timeToMin(slot.end) > timeToMin(day.open.end)) return false;
  return !day.taken.some((tk) => rangesOverlap(slot, tk));
}

let passed = 0;
let failed = 0;

function expect(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`✓ ${label}`);
    passed++;
  } else {
    console.log(`✗ ${label}`);
    console.log(`  esperado: ${JSON.stringify(expected)}`);
    console.log(`  actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

// =========================================================
// Test 1: día sin reservas, slot 1h
// =========================================================
{
  const day = {
    date: "2026-04-22",
    weekday: 3,
    label: "Mié 22 abr",
    open: { start: "10:00", end: "16:00" },
    taken: []
  };
  const slots = getSlotsForDay(day, 1);
  expect("día vacío L-V 10-16, slot 1h: 6 slots disponibles", slots.length, 6);
  expect("todos disponibles", slots.every((s) => s.available), true);
}

// =========================================================
// Test 2: una reserva 11:00-13:00 bloquea slots que se solapen
// =========================================================
{
  const day = {
    date: "2026-04-22",
    weekday: 3,
    label: "Mié 22 abr",
    open: { start: "10:00", end: "16:00" },
    taken: [{ start: "11:00", end: "13:00" }]
  };
  const slots1h = getSlotsForDay(day, 1);
  // slots: 10, 11, 12, 13, 14, 15
  // 11 y 12 deben estar bloqueados (se solapan con 11-13)
  // 10, 13, 14, 15 deben estar disponibles
  const map = Object.fromEntries(slots1h.map((s) => [s.startTime, s.available]));
  expect("slot 10:00 disponible", map["10:00"], true);
  expect("slot 11:00 BLOQUEADO", map["11:00"], false);
  expect("slot 12:00 BLOQUEADO", map["12:00"], false);
  expect("slot 13:00 disponible", map["13:00"], true);
  expect("slot 14:00 disponible", map["14:00"], true);
  expect("slot 15:00 disponible", map["15:00"], true);
}

// =========================================================
// Test 3: slot largo de 3h con reserva en medio
// =========================================================
{
  const day = {
    date: "2026-04-22",
    weekday: 3,
    label: "Mié 22 abr",
    open: { start: "10:00", end: "16:00" },
    taken: [{ start: "12:00", end: "13:00" }]
  };
  const slots3h = getSlotsForDay(day, 3);
  // candidatos start: 10, 11, 12, 13
  // 10:00-13:00 → solapa (10-13 vs 12-13) → BLOQUEADO
  // 11:00-14:00 → solapa → BLOQUEADO
  // 12:00-15:00 → solapa → BLOQUEADO
  // 13:00-16:00 → no solapa → DISPONIBLE
  const map = Object.fromEntries(slots3h.map((s) => [s.startTime, s.available]));
  expect("3h start 10:00 BLOQUEADO (solapa con 12-13)", map["10:00"], false);
  expect("3h start 11:00 BLOQUEADO", map["11:00"], false);
  expect("3h start 12:00 BLOQUEADO", map["12:00"], false);
  expect("3h start 13:00 disponible", map["13:00"], true);
}

// =========================================================
// Test 4: sesión de 5.5h NO debe poder agendarse encima de otra
// (caso reportado por usuario)
// =========================================================
{
  // Snapshot con 2 días: hoy hay reserva 11-13, mañana libre
  const snapshot = [
    {
      date: "2026-04-22",
      weekday: 3,
      label: "Mié 22 abr",
      open: { start: "10:00", end: "16:00" },
      taken: [{ start: "11:00", end: "13:00" }]
    },
    {
      date: "2026-04-23",
      weekday: 4,
      label: "Jue 23 abr",
      open: { start: "10:00", end: "16:00" },
      taken: []
    }
  ];
  // Sesión de 5.5h se divide en 2 bloques de 3h. Probemos:
  // - Bloque 1 a las 11:00 del 22 (BLOQUEADO porque hay reserva 11-13)
  // - Bloque 2 a las 11:00 del 23 (libre)
  expect(
    "5.5h: bloque a las 11:00 sobre reserva existente RECHAZADO",
    isSlotAvailable(snapshot, "2026-04-22", "11:00", 3),
    false
  );
  expect(
    "5.5h: bloque a las 11:00 día libre ACEPTADO",
    isSlotAvailable(snapshot, "2026-04-23", "11:00", 3),
    true
  );
  // Edge case: empieza justo al final de una reserva (13:00) — debe ser válido
  expect(
    "Empieza justo cuando termina la otra (13:00 después de 11-13)",
    isSlotAvailable(snapshot, "2026-04-22", "13:00", 3),
    true
  );
}

// =========================================================
// Test 5: día con varias reservas dispersas
// =========================================================
{
  const day = {
    date: "2026-04-22",
    weekday: 3,
    label: "Mié 22 abr",
    open: { start: "10:00", end: "16:00" },
    taken: [
      { start: "10:00", end: "11:00" },
      { start: "13:00", end: "14:00" }
    ]
  };
  const slots1h = getSlotsForDay(day, 1);
  const map = Object.fromEntries(slots1h.map((s) => [s.startTime, s.available]));
  expect("10:00 BLOQUEADO", map["10:00"], false);
  expect("11:00 disponible", map["11:00"], true);
  expect("12:00 disponible", map["12:00"], true);
  expect("13:00 BLOQUEADO", map["13:00"], false);
  expect("14:00 disponible", map["14:00"], true);
  expect("15:00 disponible", map["15:00"], true);
}

// =========================================================
// Test 6: día cerrado (open = null)
// =========================================================
{
  const day = {
    date: "2026-04-26",
    weekday: 0,
    label: "Dom 26 abr",
    open: null,
    taken: []
  };
  const slots = getSlotsForDay(day, 1);
  expect("día cerrado: 0 slots", slots.length, 0);
}

// =========================================================
// Test 7: slot que excede horario de cierre
// =========================================================
{
  const day = {
    date: "2026-04-22",
    weekday: 3,
    label: "Mié 22 abr",
    open: { start: "10:00", end: "16:00" },
    taken: []
  };
  const slots3h = getSlotsForDay(day, 3);
  // candidatos: 10, 11, 12, 13. (13+3=16 está OK como límite estricto)
  // 14:00 + 3h = 17:00 → fuera, no debe aparecer
  const startTimes = slots3h.map((s) => s.startTime);
  expect("3h slots: 4 candidatos válidos (10-13)", startTimes.length, 4);
  expect("Último start 13:00", startTimes[startTimes.length - 1], "13:00");
}

// =========================================================
// Resumen
// =========================================================
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
