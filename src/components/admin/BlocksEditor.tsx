"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDateLong } from "@/lib/utils";
import type { ScheduleBlock } from "@/lib/blocks/sheets";

export function BlocksEditor({ initial }: { initial: ScheduleBlock[] }) {
  const router = useRouter();
  const [blocks, setBlocks] = React.useState<ScheduleBlock[]>(initial);
  const [date, setDate] = React.useState("");
  const [allDay, setAllDay] = React.useState(true);
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const add = async () => {
    if (!date) {
      setError("Selecciona una fecha");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          allDay,
          startTime: allDay ? undefined : start,
          endTime: allDay ? undefined : end,
          reason
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      // reset form
      setDate("");
      setAllDay(true);
      setStart("");
      setEnd("");
      setReason("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este bloqueo?")) return;
    const prev = blocks;
    setBlocks((b) => b.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/admin/blocks?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch {
      setBlocks(prev);
      alert("No se pudo eliminar. Reintenta.");
    }
  };

  // Ordenar por fecha ascendente
  const sorted = [...blocks].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-10">
      <section className="border border-line bg-surface p-6 md:p-8">
        <h2 className="eyebrow mb-5">Nuevo bloqueo</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <Label>Fecha</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-6">
            <Checkbox checked={allDay} onCheckedChange={(v) => setAllDay(!!v)} />
            <span className="text-sm">Día completo</span>
          </label>

          {!allDay && (
            <>
              <div>
                <Label>Desde</Label>
                <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div>
                <Label>Hasta</Label>
                <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <Label>Motivo</Label>
            <Textarea
              rows={2}
              placeholder="Ej: Feriado nacional, vacaciones, cita privada..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-xs text-danger mt-3">{error}</p>}

        <div className="mt-5 flex justify-end">
          <Button onClick={add} disabled={saving || !date}>
            <Plus className="h-4 w-4" /> {saving ? "Guardando…" : "Agregar bloqueo"}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="eyebrow mb-4">Bloqueos activos</h2>
        {sorted.length === 0 ? (
          <div className="border border-line bg-surface p-10 text-center text-muted text-sm">
            Sin bloqueos. La agenda está abierta según los horarios normales.
          </div>
        ) : (
          <div className="border border-line bg-surface divide-y divide-line">
            {sorted.map((b) => (
              <div key={b.id} className="p-4 sm:p-5 flex items-start gap-3">
                <CalendarX className="h-5 w-5 text-muted shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg capitalize">
                    {formatDateLong(b.date)}
                  </div>
                  <div className="text-xs text-ink-soft">
                    {b.allDay
                      ? "Día completo"
                      : `${b.startTime ?? "—"} a ${b.endTime ?? "—"}`}
                  </div>
                  {b.reason && (
                    <div className="text-sm mt-1">{b.reason}</div>
                  )}
                </div>
                <button
                  onClick={() => remove(b.id)}
                  className="text-muted hover:text-danger p-2 -mt-1 -mr-2"
                  aria-label="Eliminar bloqueo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
