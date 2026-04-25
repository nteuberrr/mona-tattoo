/**
 * Limpia los datos de reservas/clientes/tatuajes/solicitudes de la Sheet.
 * Mantiene los headers. NO toca config, precios, horas, bloqueos ni usuarios.
 *
 * Corre: node scripts/reset-data.mjs
 *
 * Lee SHEETS_WEBHOOK_URL y SHEETS_WEBHOOK_SECRET desde .env.local.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("✗ No encontré .env.local. Asegúrate de estar en la raíz del proyecto.");
  process.exit(1);
}

const env = Object.fromEntries(
  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      if (i < 0) return null;
      const key = l.slice(0, i).trim();
      let val = l.slice(i + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      return [key, val];
    })
    .filter(Boolean)
);

const url = env.SHEETS_WEBHOOK_URL;
const secret = env.SHEETS_WEBHOOK_SECRET;

if (!url || !secret) {
  console.error("✗ SHEETS_WEBHOOK_URL o SHEETS_WEBHOOK_SECRET no configurados en .env.local");
  process.exit(1);
}

const SHEETS_TO_CLEAR = ["Reservas", "Tatuajes", "Solicitudes_Especiales", "Correos_Log"];

const skipPrompt = process.argv.includes("--yes");

console.log("\n⚠️  Esto va a BORRAR todos los datos de:");
SHEETS_TO_CLEAR.forEach((s) => console.log(`   - ${s}`));
console.log("\n   (NO toca: precios, horas, horarios, bloqueos, datos de pago, descuentos, usuarios)");

if (!skipPrompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question('\nEscribe "BORRAR" para confirmar: ', resolve);
  });
  rl.close();
  if (answer.trim() !== "BORRAR") {
    console.log("\nCancelado. No se borró nada.");
    process.exit(0);
  }
}

console.log("\n→ Llamando al webhook…");

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "clearSheetData",
    secret,
    payload: { sheets: SHEETS_TO_CLEAR }
  })
});

if (!res.ok) {
  console.error(`✗ HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const data = await res.json();
if (data.error) {
  console.error("✗ Error:", data.error);
  process.exit(1);
}

console.log("\n✓ Limpieza completada:");
for (const [sheet, count] of Object.entries(data.cleared || {})) {
  console.log(`   ${sheet}: ${count === "no encontrada" ? "no encontrada" : `${count} fila(s) borradas`}`);
}
console.log("\nListo. La base está en cero.");
