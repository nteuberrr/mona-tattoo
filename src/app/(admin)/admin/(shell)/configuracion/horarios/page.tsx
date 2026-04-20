import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function HorariosPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/configuracion" className="eyebrow hover:text-ink">
            ← Configuración
          </Link>
          <h1 className="display-md mt-1">Horarios de atención</h1>
        </div>
        <Badge variant="outline">Fase 2 · en construcción</Badge>
      </div>
      <div className="border border-line bg-surface p-10 text-ink-soft">
        Default actual: Lunes a Viernes, 10:00–16:00. Fase 2 permite modificar
        el default, bloquear días puntuales y franjas específicas.
      </div>
    </div>
  );
}
