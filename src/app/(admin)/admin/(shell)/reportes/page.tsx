import { Badge } from "@/components/ui/badge";

export default function ReportesPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">Analítica</span>
          <h1 className="display-md mt-1">Reportes</h1>
        </div>
        <Badge variant="outline">Fase 3 · en construcción</Badge>
      </div>
      <div className="border border-line bg-surface p-10 text-ink-soft">
        Ingresos, sesiones por mes, promedio por tatuaje, zonas más tatuadas,
        distribución por estilo / color.
      </div>
    </div>
  );
}
