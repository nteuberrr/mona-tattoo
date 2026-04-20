import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BlocksEditor } from "@/components/admin/BlocksEditor";
import { fetchBlocks } from "@/lib/blocks/sheets";

export const dynamic = "force-dynamic";

export default async function BloqueosPage() {
  const blocks = await fetchBlocks();

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/configuracion" className="eyebrow hover:text-ink">
            ← Configuración
          </Link>
          <h1 className="display-md mt-1">Bloqueos de agenda</h1>
          <p className="text-sm text-ink-soft mt-2 max-w-2xl">
            Marca feriados, vacaciones o franjas puntuales en las que no quieres
            recibir reservas. Estos días se ocultan del calendario del flujo público.
          </p>
        </div>
        <Badge variant="outline">Guarda en Google Sheets</Badge>
      </div>

      <BlocksEditor initial={blocks} />
    </div>
  );
}
