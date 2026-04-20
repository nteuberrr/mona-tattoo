import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MatrixEditor } from "@/components/admin/MatrixEditor";
import { fetchMatrices } from "@/lib/pricing/sheets";

export const dynamic = "force-dynamic";

export default async function PreciosPage() {
  const { pricing } = await fetchMatrices();

  return (
    <div className="max-w-6xl space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/configuracion" className="eyebrow hover:text-ink">
            ← Configuración
          </Link>
          <h1 className="display-md mt-1">Tabla de precios</h1>
          <p className="text-sm text-ink-soft mt-2 max-w-2xl">
            Edita directamente los precios (en CLP) para cada combinación de
            ancho × alto en cm, separado por estilo.{" "}
            <span className="text-muted">
              Las celdas vacías marcan "tamaño no disponible" → el flujo de
              reserva las etiqueta como "tamaño especial".
            </span>
          </p>
        </div>
        <Badge variant="outline">Guarda en Google Sheets</Badge>
      </div>

      <MatrixEditor
        endpoint="/api/admin/pricing"
        initial={pricing}
        numberFormat="integer"
      />
    </div>
  );
}
