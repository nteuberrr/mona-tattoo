import { Badge } from "@/components/ui/badge";
import { WeeklyAgenda } from "@/components/admin/WeeklyAgenda";

export default function AgendaPage() {
  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">Planificación</span>
          <h1 className="display-md mt-1">Agenda</h1>
        </div>
        <Badge variant="outline">Fase 2a · cambios no persisten aún</Badge>
      </div>
      <WeeklyAgenda />
    </div>
  );
}
