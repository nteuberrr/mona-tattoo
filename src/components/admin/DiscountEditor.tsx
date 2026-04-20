"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function DiscountEditor({
  initial
}: {
  initial: { multiTattooActive: boolean; multiTattooPct: number };
}) {
  const router = useRouter();
  const [active, setActive] = React.useState(initial.multiTattooActive);
  const [pct, setPct] = React.useState(String(initial.multiTattooPct));
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descuento_multi_tatuaje_activo: active ? "TRUE" : "FALSE",
          descuento_multi_tatuaje_pct: pct
        })
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
    <div className="space-y-8">
      <section className="border border-line bg-surface p-6 md:p-8">
        <h2 className="eyebrow mb-5">Descuento multi-tatuaje</h2>
        <p className="text-sm text-ink-soft mb-6">
          Si un cliente se hace más de un tatuaje en la misma sesión, el primero
          se paga a precio completo y desde el <strong>segundo en adelante</strong>{" "}
          se aplica un descuento. El descuento recae sobre los de{" "}
          <strong>menor valor</strong> (el más caro queda a precio lleno).
        </p>

        <div className="space-y-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={active}
              onCheckedChange={(v) => {
                setActive(!!v);
                setSaved(false);
              }}
            />
            <span className="text-sm">
              {active ? "Descuento activo" : "Descuento desactivado"}
            </span>
          </label>

          <div className={active ? "" : "opacity-50 pointer-events-none"}>
            <Label>Porcentaje (%)</Label>
            <div className="flex items-center gap-2 max-w-[150px]">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={pct}
                onChange={(e) => {
                  setPct(e.target.value);
                  setSaved(false);
                }}
              />
              <span className="text-muted">%</span>
            </div>
            <p className="text-xs text-muted mt-2">
              Ej: 10 → 10% de descuento sobre los tatuajes desde el segundo.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-danger/10 text-danger border border-danger/40 p-3 text-sm">
          Error al guardar: {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-[#3E5E3E]">✓ Guardado</span>}
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando…" : saved ? "Guardar de nuevo" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
