/**
 * Lectura y escritura de la hoja Configuracion via Apps Script.
 * Los valores se guardan como strings; el consumer los interpreta.
 */

import { callSheets, isSheetsConfigured } from "@/lib/sheets/client";

export type ConfigMap = Record<string, string>;

export async function getConfig(): Promise<ConfigMap> {
  if (!isSheetsConfigured()) return {};
  const res = await callSheets<{ config: Record<string, unknown> }>("getConfig");
  if (!res.ok) {
    console.error("[config] getConfig falló:", res.error);
    return {};
  }
  const out: ConfigMap = {};
  for (const [k, v] of Object.entries(res.data.config ?? {})) {
    out[k] = v === null || v === undefined ? "" : String(v);
  }
  return out;
}

export async function saveConfig(payload: Record<string, string | number>): Promise<{ ok: boolean; error?: string }> {
  if (!isSheetsConfigured()) {
    return { ok: false, error: "Sheets no configurado" };
  }
  const res = await callSheets("saveConfig", payload as Record<string, unknown>);
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true };
}

// Defaults razonables por si la Sheet aún no tiene valores
export const CONFIG_DEFAULTS = {
  admin_email: "agenda.monatatt@gmail.com",
  estudio_direccion: "",
  instagram: "@mona.tatt",
  banco_titular: "",
  banco_rut: "",
  banco_nombre: "",
  banco_cuenta_tipo: "",
  banco_cuenta_numero: "",
  banco_email_comprobante: "agenda.monatatt@gmail.com",
  deposito_modo: "PERCENTAGE",
  deposito_valor: "30",
  horario_lunes: "10:00-16:00",
  horario_martes: "10:00-16:00",
  horario_miercoles: "10:00-16:00",
  horario_jueves: "10:00-16:00",
  horario_viernes: "10:00-16:00",
  horario_sabado: "off",
  horario_domingo: "off",
  descuento_multi_tatuaje_pct: "10",
  descuento_multi_tatuaje_activo: "TRUE"
} as const;

export function configValue(config: ConfigMap, key: keyof typeof CONFIG_DEFAULTS): string {
  return config[key] ?? CONFIG_DEFAULTS[key];
}
