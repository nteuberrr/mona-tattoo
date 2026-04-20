import { Badge } from "@/components/ui/badge";

export default function AgendaPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">Planificación</span>
          <h1 className="display-md mt-1">Agenda</h1>
        </div>
        <Badge variant="outline">Fase 2 · en construcción</Badge>
      </div>
      <div className="border border-line bg-surface p-10 text-ink-soft">
        <p>
          Próximamente: vista semanal L–V 10–16, bandeja de reservas pendientes
          de confirmar, panel lateral con comprobantes, acciones confirmar /
          rechazar / reagendar.
        </p>
      </div>
    </div>
  );
}
