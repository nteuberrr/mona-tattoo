"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Matrix } from "@/lib/pricing/types";

const SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const STYLES = ["lineal", "realista"] as const;
type Style = (typeof STYLES)[number];

type MatrixState = Record<Style, (number | null)[][]>;

function matrixFromSheet(m: Matrix | null): (number | null)[][] {
  const empty = SIZES.map(() => SIZES.map(() => null as number | null));
  if (!m) return empty;
  return SIZES.map((h, hi) => {
    const rowIdx = m.heights.indexOf(h);
    return SIZES.map((w, wi) => {
      const colIdx = m.widths.indexOf(w);
      if (rowIdx < 0 || colIdx < 0) return null;
      const v = m.matrix[rowIdx]?.[colIdx];
      return typeof v === "number" ? v : null;
    });
  });
}

export function MatrixEditor({
  endpoint,
  initial,
  unit,
  numberFormat
}: {
  /** '/api/admin/pricing' o '/api/admin/hours' */
  endpoint: string;
  initial: { lineal: Matrix | null; realista: Matrix | null };
  /** Sufijo visual en celdas (ej. 'h' o '$') — solo para preview de lectura */
  unit?: string;
  /** 'integer' para CLP (sin decimales), 'decimal' para horas (con .5) */
  numberFormat: "integer" | "decimal";
}) {
  const router = useRouter();
  const [style, setStyle] = React.useState<Style>("lineal");
  const [matrix, setMatrix] = React.useState<MatrixState>({
    lineal: matrixFromSheet(initial.lineal),
    realista: matrixFromSheet(initial.realista)
  });
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const setCell = (r: number, c: number, raw: string) => {
    setSaved(false);
    const trimmed = raw.trim();
    let n: number | null = null;
    if (trimmed !== "") {
      const parsed = Number(trimmed.replace(",", "."));
      if (Number.isFinite(parsed)) {
        n = numberFormat === "integer" ? Math.round(parsed) : parsed;
      }
    }
    setMatrix((prev) => ({
      ...prev,
      [style]: prev[style].map((row, rr) =>
        rr === r ? row.map((v, cc) => (cc === c ? n : v)) : row
      )
    }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        lineal: { widths: SIZES, heights: SIZES, matrix: matrix.lineal },
        realista: { widths: SIZES, heights: SIZES, matrix: matrix.realista }
      };
      const res = await fetch(endpoint, {
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

  const active = matrix[style];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
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
                <th
                  key={w}
                  className="border-b border-line p-2 text-muted font-normal min-w-[72px] text-xs"
                >
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
                {SIZES.map((_, c) => {
                  const cell = active[r][c];
                  const display =
                    cell == null
                      ? ""
                      : numberFormat === "decimal"
                      ? cell.toFixed(1)
                      : String(cell);
                  return (
                    <td key={c} className="border-b border-l border-line">
                      <input
                        type="text"
                        inputMode={numberFormat === "integer" ? "numeric" : "decimal"}
                        value={display}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        className="w-full h-10 text-right px-2 bg-transparent font-body text-sm focus:outline-none focus:bg-line/40"
                        placeholder="—"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger border border-danger/40 p-3 text-sm">
          Error al guardar: {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-xs text-[#3E5E3E]">✓ Guardado en Google Sheets</span>
        )}
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando…" : saved ? "Guardar de nuevo" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
