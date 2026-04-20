import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MatrixEditor } from "@/components/admin/MatrixEditor";
import { fetchMatrices } from "@/lib/pricing/sheets";

export const dynamic = "force-dynamic";

export default async function MatrizHorasPage() {
  const { hours } = await fetchMatrices();

  return (
    <div className="max-w-6xl space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/configuracion" className="eyebrow hover:text-ink">
            ← Configuración
          </Link>
          <h1 className="display-md mt-1">Matriz de horas</h1>
          <p className="text-sm text-ink-soft mt-2 max-w-2xl">
            Define cuánto demora cada combinación de{" "}
            <strong>ancho × alto (cm)</strong>, separado por estilo. Alimenta el
            cálculo de slots disponibles en el flujo de reserva. Usa decimales
            con punto (ej: <code>1.5</code>).
          </p>
        </div>
        <Badge variant="outline">Guarda en Google Sheets</Badge>
      </div>

      <MatrixEditor
        endpoint="/api/admin/hours"
        initial={hours}
        numberFormat="decimal"
      />
    </div>
  );
}
