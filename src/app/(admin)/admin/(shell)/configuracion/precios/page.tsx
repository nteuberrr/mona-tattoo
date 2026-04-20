"use client";

import * as React from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCLP } from "@/lib/utils";

type Block = {
  title: string;
  // grid[height][width] = precio en CLP
  grid: (number | null)[][];
  widths: number[];
  heights: number[];
};

const EXPECTED_TITLES = [
  "Precios Lineales",
  "Precios realistas",
  "Horas que toma el lineal",
  "Horas que toma el realista"
];

/**
 * Parseo tolerante: recorre todo el sheet buscando los títulos conocidos.
 * Para cada título asume la estructura:
 *   A_n+1   | "Ancho / Alto"
 *   A_n+2   | 1 | 2 | 3 ... (widths en la fila de headers)
 *   A_n+3   | height row con height en col A y precios a la derecha
 */
function parseSheet(wb: XLSX.WorkBook): Block[] {
  const blocks: Block[] = [];
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
        const match = EXPECTED_TITLES.find((t) =>
          cell.trim().toLowerCase().startsWith(t.toLowerCase())
        );
        if (!match) return;

        // headers row (widths) esperado en r+1 a partir de la columna c+1
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
          blocks.push({ title: match, grid, widths, heights });
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
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onFile = async (file: File) => {
    setError(null);
    setSaved(false);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const parsed = parseSheet(wb);
      if (parsed.length === 0) {
        setError("No encontré ninguna de las 4 tablas esperadas. Revisa que los títulos digan exactamente: Precios Lineales, Precios realistas, Horas que toma el lineal, Horas que toma el realista.");
        return;
      }
      setBlocks(parsed);
      setFileName(file.name);
    } catch (e: any) {
      setError(`No pude leer el Excel: ${e?.message ?? "formato inválido"}`);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      // TODO Fase 2: POST a /api/admin/precios que escriba PriceTable + HourMatrix en DB.
      await new Promise((r) => setTimeout(r, 800));
      setSaved(true);
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
        </div>
        <Badge variant="outline">Fase 1.5 · sin persistencia real</Badge>
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
            Espero 4 tablas: Precios Lineales, Precios realistas, Horas que
            toma el lineal, Horas que toma el realista.
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
        {error && <p className="text-sm text-danger mt-3">{error}</p>}
      </section>

      {blocks.length > 0 && (
        <section className="space-y-8">
          <div>
            <h2 className="eyebrow">2 · Previsualización</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Detecté <strong>{blocks.length}</strong> tabla(s) en el archivo.
              Revísalas antes de guardar.
            </p>
          </div>

          {blocks.map((b, i) => (
            <BlockPreview key={i} block={b} />
          ))}

          <div className="pt-4 flex items-center justify-end gap-3">
            {saved && (
              <span className="text-xs text-muted inline-flex items-center gap-1">
                <Check className="h-4 w-4 text-[#3E5E3E]" />
                Guardado localmente (Fase 2 persiste en DB)
              </span>
            )}
            <Button onClick={save} disabled={saving}>
              {saving ? "Guardando…" : "Guardar tablas"}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function BlockPreview({ block }: { block: Block }) {
  const isPrice = block.title.toLowerCase().startsWith("precios");
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
                    {v == null ? "—" : isPrice ? formatCLP(v) : `${v} h`}
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
