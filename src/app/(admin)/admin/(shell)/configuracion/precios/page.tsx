"use client";

import * as React from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCLP } from "@/lib/utils";

type Block = {
  key: "lineal" | "realista";
  title: string;
  grid: (number | null)[][];
  widths: number[];
  heights: number[];
};

const EXPECTED_TABLES: { match: string; key: Block["key"]; title: string }[] = [
  { match: "precios lineales", key: "lineal", title: "Precios Lineales" },
  { match: "precios realistas", key: "realista", title: "Precios Realistas" }
];

/**
 * Parser tolerante: busca "Precios Lineales" y "Precios realistas" en cualquier
 * celda (case-insensitive). Para cada título toma la fila siguiente como
 * header de anchos y las filas sucesivas como precios por alto.
 */
function parseSheet(wb: XLSX.WorkBook): Block[] {
  const blocks: Block[] = [];
  const found = new Set<string>();

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const json: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      raw: true
    });

    json.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (typeof cell !== "string") return;
        const normalized = cell.trim().toLowerCase();
        const target = EXPECTED_TABLES.find((t) => normalized.startsWith(t.match));
        if (!target || found.has(target.key)) return;

        const headerRow = json[r + 1] ?? [];
        const widths: number[] = [];
        for (let cc = c + 1; cc < headerRow.length; cc++) {
          const v = headerRow[cc];
          if (typeof v === "number") widths.push(v);
          else if (widths.length > 0) break;
        }
        if (widths.length === 0) return;

        const heights: number[] = [];
        const grid: (number | null)[][] = [];

        for (let rr = r + 2; rr < json.length; rr++) {
          const rowData = json[rr] ?? [];
          const h = rowData[c];
          if (typeof h !== "number") break;
          heights.push(h);
          const values: (number | null)[] = [];
          for (let i = 0; i < widths.length; i++) {
            const v = rowData[c + 1 + i];
            values.push(typeof v === "number" ? v : null);
          }
          grid.push(values);
        }

        if (heights.length > 0) {
          blocks.push({ key: target.key, title: target.title, grid, widths, heights });
          found.add(target.key);
        }
      });
    });
  }
  return blocks;
}

export default function PreciosPage() {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onFile = async (file: File) => {
    setParseError(null);
    setSaveError(null);
    setSaved(false);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const parsed = parseSheet(wb);
      if (parsed.length === 0) {
        setParseError(
          'No encontré ninguna de las 2 tablas esperadas. Los títulos deben ser "Precios Lineales" y "Precios Realistas" (pueden estar en la misma hoja o en hojas distintas).'
        );
        return;
      }
      if (parsed.length === 1) {
        setParseError(
          `Solo encontré "${parsed[0].title}". Falta la otra tabla. Si aún no la tienes, igual puedes guardar esta y subir la otra después.`
        );
      }
      setBlocks(parsed);
      setFileName(file.name);
    } catch (e) {
      setParseError(
        e instanceof Error ? `No pude leer el Excel: ${e.message}` : "No pude leer el Excel."
      );
    }
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Record<"lineal" | "realista", unknown> = {} as any;
      for (const block of blocks) {
        payload[block.key] = {
          widths: block.widths,
          heights: block.heights,
          matrix: block.grid
        };
      }
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/configuracion" className="eyebrow hover:text-ink">
            ← Configuración
          </Link>
          <h1 className="display-md mt-1">Tabla de precios</h1>
          <p className="text-sm text-ink-soft mt-2 max-w-2xl">
            Sube un Excel con 2 matrices (ancho × alto): <strong>Precios Lineales</strong> y{" "}
            <strong>Precios Realistas</strong>. Las horas de sesión se manejan
            aparte en{" "}
            <Link href="/admin/configuracion/horas" className="underline">
              Matriz de horas
            </Link>
            .
          </p>
        </div>
        <Badge variant="outline">Guarda en Google Sheets</Badge>
      </div>

      <section>
        <h2 className="eyebrow">1 · Sube tu archivo</h2>
        <div
          onClick={() => inputRef.current?.click()}
          className="mt-3 border border-dashed border-line hover:border-ink p-10 text-center cursor-pointer transition-colors bg-surface"
        >
          <Upload className="h-6 w-6 mx-auto text-muted mb-3" />
          <p className="text-sm">
            {fileName ?? "Arrastra o haz clic para subir tu .xlsx"}
          </p>
          <p className="text-xs text-muted mt-1">
            Espero 2 tablas: Precios Lineales + Precios Realistas.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
        </div>
        {parseError && (
          <div className="mt-3 bg-[#F6E6C4] text-[#6B5217] border border-[#D9B860] p-3 text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}
      </section>

      {blocks.length > 0 && (
        <section className="space-y-8">
          <div>
            <h2 className="eyebrow">2 · Previsualización</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Detecté <strong>{blocks.length}</strong> tabla(s). Revísalas antes
              de guardar.
            </p>
          </div>

          {blocks.map((b) => (
            <BlockPreview key={b.key} block={b} />
          ))}

          {saveError && (
            <div className="bg-danger/10 text-danger border border-danger/40 p-3 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Error al guardar: {saveError}</span>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3">
            {saved && (
              <span className="text-xs inline-flex items-center gap-1 text-[#3E5E3E]">
                <Check className="h-4 w-4" /> Guardado en Google Sheets
              </span>
            )}
            <Button onClick={save} disabled={saving}>
              {saving ? "Guardando…" : saved ? "Guardar de nuevo" : "Guardar tablas"}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function BlockPreview({ block }: { block: Block }) {
  return (
    <div className="border border-line bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-line flex items-center gap-3">
        <FileSpreadsheet className="h-4 w-4 text-muted" />
        <span className="font-display text-lg">{block.title}</span>
        <span className="ml-auto text-xs text-muted">
          {block.widths.length} × {block.heights.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-surface border-b border-r border-line p-2 text-muted font-normal">
                Alto \ Ancho
              </th>
              {block.widths.map((w) => (
                <th
                  key={w}
                  className="border-b border-line p-2 text-muted font-normal min-w-[64px]"
                >
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.heights.map((h, r) => (
              <tr key={h}>
                <th className="sticky left-0 bg-surface border-r border-b border-line p-2 text-muted font-normal">
                  {h}
                </th>
                {block.grid[r]?.map((v, c) => (
                  <td
                    key={c}
                    className={cn(
                      "border-b border-l border-line p-2 text-right",
                      v == null && "text-muted/40"
                    )}
                  >
                    {v == null ? "—" : formatCLP(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
