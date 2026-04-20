import { callSheets, isSheetsConfigured } from "@/lib/sheets/client";

export type ScheduleBlock = {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  reason: string;
  allDay: boolean;
};

type RawBlock = {
  id: string;
  fecha: string | Date;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  dia_completo: string | boolean;
};

function normalize(raw: RawBlock): ScheduleBlock {
  const date =
    raw.fecha instanceof Date
      ? `${raw.fecha.getFullYear()}-${String(raw.fecha.getMonth() + 1).padStart(2, "0")}-${String(raw.fecha.getDate()).padStart(2, "0")}`
      : String(raw.fecha ?? "").split("T")[0];
  const allDay =
    typeof raw.dia_completo === "boolean"
      ? raw.dia_completo
      : String(raw.dia_completo ?? "").toUpperCase() === "TRUE";
  return {
    id: String(raw.id),
    date,
    startTime: raw.hora_inicio ? String(raw.hora_inicio) : undefined,
    endTime: raw.hora_fin ? String(raw.hora_fin) : undefined,
    reason: String(raw.motivo ?? ""),
    allDay
  };
}

export async function fetchBlocks(): Promise<ScheduleBlock[]> {
  if (!isSheetsConfigured()) return [];
  const res = await callSheets<{ blocks: RawBlock[] }>("getBlocks");
  if (!res.ok) {
    console.error("[blocks] getBlocks falló:", res.error);
    return [];
  }
  return (res.data.blocks ?? []).map(normalize);
}

export async function createBlock(block: Omit<ScheduleBlock, "id">): Promise<{ ok: boolean; error?: string }> {
  if (!isSheetsConfigured()) return { ok: false, error: "Sheets no configurado" };
  const res = await callSheets("createBlock", block as unknown as Record<string, unknown>);
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}

export async function deleteBlock(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSheetsConfigured()) return { ok: false, error: "Sheets no configurado" };
  const res = await callSheets("deleteBlock", { id });
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}
