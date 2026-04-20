import { getAllBookings } from "@/lib/bookings";
import { groupBookingsByClient } from "@/lib/clients";
import { ClientList } from "@/components/admin/ClientList";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const { bookings, source } = await getAllBookings();
  const clients = groupBookingsByClient(bookings);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">Registro</span>
          <h1 className="display-md mt-1">Clientes</h1>
          <p className="text-sm text-ink-soft mt-2 max-w-xl">
            Lista agrupada desde las reservas. Click en un cliente para ver su
            historial completo.
          </p>
        </div>
        <Badge variant={source === "sheets" ? "outline" : "muted"}>
          {source === "sheets" ? "Google Sheets · en vivo" : "Mock local"}
        </Badge>
      </div>

      <ClientList clients={clients} />
    </div>
  );
}
