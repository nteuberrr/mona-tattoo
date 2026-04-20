import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllBookings } from "@/lib/bookings";
import { findClientBookings } from "@/lib/clients";
import { statusColor, statusLabel } from "@/lib/mock-bookings";
import { formatCLP, formatDateLong, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const { bookings } = await getAllBookings();
  const list = findClientBookings(bookings, decodedId);
  if (list.length === 0) notFound();

  const client = list[0].client;
  const totalSpent = list
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-5xl space-y-8">
      <Link href="/admin/clientes" className="eyebrow inline-flex items-center gap-2 hover:text-ink">
        <ArrowLeft className="h-3 w-3" /> Volver a clientes
      </Link>

      <div>
        <h1 className="display-md">{client.name}</h1>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
          <a href={`mailto:${client.email}`} className="inline-flex items-center gap-1.5 hover:text-ink">
            <Mail className="h-3.5 w-3.5" /> {client.email}
          </a>
          {client.phone && (
            <a href={`tel:${client.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-ink">
              <Phone className="h-3.5 w-3.5" /> {client.phone}
            </a>
          )}
        </div>
      </div>

      <section className="grid sm:grid-cols-3 gap-4">
        <Stat label="Reservas totales" value={String(list.length)} />
        <Stat label="Gastado (confirmado)" value={formatCLP(totalSpent)} />
        <Stat label="Última cita" value={sorted[0]?.date ? formatDateLong(sorted[0].date) : "—"} />
      </section>

      <section>
        <h2 className="eyebrow mb-3">Historial</h2>
        <div className="border border-line bg-surface divide-y divide-line">
          {sorted.map((b) => {
            const c = statusColor(b.status);
            return (
              <Link
                key={b.id}
                href={`/admin/citas/${b.id}`}
                className="p-4 sm:p-5 flex items-start gap-3 hover:bg-line/30 transition-colors"
              >
                <div className={cn("w-1 self-stretch border-l-4", c.border)} />
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg capitalize">{formatDateLong(b.date)}</div>
                  <div className="text-xs text-ink-soft mt-1">
                    {b.startTime} – {b.endTime} · {b.tattoos.length} tat · {b.totalHours}h
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={cn(c.bg, c.text, "border-0")}>
                    {statusLabel(b.status)}
                  </Badge>
                  <div className="font-display text-lg mt-1">{formatCLP(b.totalPrice)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-surface p-5">
      <div className="text-xs uppercase tracking-editorial text-muted">{label}</div>
      <div className="font-display text-2xl mt-2 capitalize">{value}</div>
    </div>
  );
}
