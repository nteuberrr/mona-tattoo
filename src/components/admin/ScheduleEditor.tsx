"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const DAYS = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" }
] as const;

type DayKey = (typeof DAYS)[number]["key"];

type DaySchedule = {
  open: boolean;
  start: string;
  end: string;
};

function parseDay(value: string | undefined): DaySchedule {
  if (!value || value === "off") return { open: false, start: "10:00", end: "16:00" };
  const m = value.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (m) return { open: true, start: m[1], end: m[2] };
  return { open: false, start: "10:00", end: "16:00" };
}

function formatDay(d: DaySchedule): string {
  if (!d.open) return "off";
  return `${d.start}-${d.end}`;
}

export function ScheduleEditor({ initial }: { initial: Record<DayKey, string> }) {
  const router = useRouter();
  const [days, setDays] = React.useState<Record<DayKey, DaySchedule>>(() => {
    const out = {} as Record<DayKey, DaySchedule>;
    for (const d of DAYS) out[d.key] = parseDay(initial[d.key]);
    return out;
  });
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const update = (key: DayKey, patch: Partial<DaySchedule>) => {
    setSaved(false);
    setDays((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, string> = {};
      for (const d of DAYS) {
        payload[`horario_${d.key}`] = formatDay(days[d.key]);
      }
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-line bg-surface divide-y divide-line">
        {DAYS.map((d) => {
          const v = days[d.key];
          return (
            <div
              key={d.key}
              className={cn(
                "p-4 sm:p-5 grid sm:grid-cols-[120px_110px_1fr_1fr] gap-4 items-center",
                !v.open && "opacity-60"
              )}
            >
              <div className="font-display text-lg">{d.label}</div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={v.open}
                  onCheckedChange={(val) => update(d.key, { open: !!val })}
                />
                {v.open ? "Abierto" : "Cerrado"}
              </label>
              <div>
                <Label>Desde</Label>
                <Input
                  type="time"
                  disabled={!v.open}
                  value={v.start}
                  onChange={(e) => update(d.key, { start: e.target.value })}
                />
              </div>
              <div>
                <Label>Hasta</Label>
                <Input
                  type="time"
                  disabled={!v.open}
                  value={v.end}
                  onChange={(e) => update(d.key, { end: e.target.value })}
                />
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-danger/10 text-danger border border-danger/40 p-3 text-sm">
          Error al guardar: {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-[#3E5E3E]">✓ Guardado</span>}
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando…" : saved ? "Guardar de nuevo" : "Guardar horarios"}
        </Button>
      </div>
    </div>
  );
}
