/**
 * Mata cualquier proceso que esté escuchando en el puerto pasado como argumento
 * (default 3100). Silencioso si no encuentra nada. Funciona en Windows, macOS y Linux.
 */
import { execSync } from "node:child_process";

const port = Number(process.argv[2] ?? 3100);

function runSilently(cmd) {
  try {
    return execSync(cmd, { stdio: ["pipe", "pipe", "ignore"] }).toString();
  } catch {
    return "";
  }
}

function killWindows() {
  const out = runSilently(`netstat -ano | findstr :${port}`);
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    const m = line.trim().match(/LISTENING\s+(\d+)/i);
    if (m) pids.add(m[1]);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`✦ Puerto ${port} liberado (PID ${pid}).`);
    } catch {}
  }
}

function killUnix() {
  const out = runSilently(`lsof -t -i:${port}`);
  const pids = out.trim().split(/\s+/).filter(Boolean);
  for (const pid of pids) {
    try {
      execSync(`kill -9 ${pid}`, { stdio: "ignore" });
      console.log(`✦ Puerto ${port} liberado (PID ${pid}).`);
    } catch {}
  }
}

if (process.platform === "win32") killWindows();
else killUnix();
