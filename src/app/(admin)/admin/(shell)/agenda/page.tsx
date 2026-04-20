import { Badge } from "@/components/ui/badge";
import { WeeklyAgenda } from "@/components/admin/WeeklyAgenda";
import { getAllBookings } from "@/lib/bookings";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const { bookings, source } = await getAllBookings();
  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">Planificación</span>
          <h1 className="display-md mt-1">Agenda</h1>
        </div>
        <Badge variant={source === "sheets" ? "outline" : "muted"}>
          {source === "sheets" ? "Conectado a Google Sheets" : "Fase 2a · mock local"}
        </Badge>
      </div>
      <WeeklyAgenda initialBookings={bookings} />
    </div>
  );
}
