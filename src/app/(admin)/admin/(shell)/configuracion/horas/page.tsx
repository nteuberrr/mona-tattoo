"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const STYLES = ["lineal", "realista"] as const;
type Style = (typeof STYLES)[number];

// Seed basado en lo que mostraste: lineal crece 1.0 → 2.5, realista algo superior.
const seedHours = (style: Style, w: number, h: number): number | null => {
  const max = Math.max(w, h);
  const base = style === "realista" ? 0.5 : 0;
  if (max <= 3) return 1.0 + base;
  if (max <= 7) return 1.5 + base;
  if (max <= 10) return 2.0 + base;
  if (max <= 13) return 2.5 + base;
  return 3.0 + base;
};

type Matrix = Record<Style, (number | null)[][]>;
function initMatrix(): Matrix {
  return {
    lineal: SIZES.map((h) => SIZES.map((w) => seedHours("lineal", w, h))),
    realista: SIZES.map((h) => SIZES.map((w) => seedHours("realista", w, h)))
  };
}

export default function MatrizHorasPage() {
  const [style, setStyle] = React.useState<Style>("lineal");
  const [matrix, setMatrix] = React.useState<Matrix>(initMatrix);
  const [saving, setSaving] = React.useState(false);

  const setCell = (r: number, c: number, raw: string) => {
    const n = raw === "" ? null : Number(raw.replace(",", "."));
    setMatrix((prev) => ({
      ...prev,
      [style]: prev[style].map((row, rr) =>
        rr === r ? row.map((v, cc) => (cc === c ? (Number.isFinite(n as number) ? (n as number) : null) : v)) : row
      )
    }));
  };

  const save = async () => {
    setSaving(true);
    // TODO Fase 2: POST /api/admin/matriz-horas → Prisma HourMatrix
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
  };

  const active = matrix[style];

  return (
    <div className="max-w-6xl space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/configuracion" className="eyebrow hover:text-ink">
            ← Configuración
          </Link>
          <h1 className="display-md mt-1">Matriz de horas</h1>
        </div>
        <Badge variant="outline">Fase 1.5 · sin persistencia</Badge>
      </div>

      <p className="text-ink-soft max-w-2xl">
        Define cuánto demora cada combinación de <strong>ancho × alto (cm)</strong>,
        por estilo. Esta matriz alimenta el cálculo de slots disponibles en el
        flujo de reserva. Usa valores decimales con <code>.</code> (ej: 1.5).
      </p>

      <div className="flex items-center gap-2">
        {STYLES.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={cn(
              "px-5 h-10 border text-sm uppercase tracking-editorial transition-colors capitalize",
              style === s ? "bg-ink text-bg border-ink" : "border-line hover:border-ink"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="border border-line bg-surface overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-surface border-b border-r border-line p-2 text-muted font-normal text-xs">
                Alto \ Ancho
              </th>
              {SIZES.map((w) => (
                <th key={w} className="border-b border-line p-2 text-muted font-normal min-w-[56px] text-xs">
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZES.map((h, r) => (
              <tr key={h}>
                <th className="sticky left-0 bg-surface border-r border-b border-line p-2 text-muted font-normal text-xs">
                  {h}
                </th>
                {SIZES.map((_, c) => (
                  <td key={c} className="border-b border-l border-line">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={active[r][c] ?? ""}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      className="w-full h-9 text-center bg-transparent font-body text-sm focus:outline-none focus:bg-line/40"
                      placeholder="—"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Guardar matriz"}
        </Button>
      </div>
    </div>
  );
}
