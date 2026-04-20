import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllBookings } from "@/lib/bookings";
import { findClientBookings } from "@/lib/clients";
import { statusColor, statusLabel } from "@/lib/mock-bookings";
import { formatCLP, formatDateLong, formatDateShort, formatHours, cn } from "@/lib/utils";

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
  const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));

  const completed = list.filter((b) => b.status === "COMPLETED");
  const confirmed = list.filter((b) => b.status === "CONFIRMED");
  const realized = list.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED");

  const totalSpent = realized.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const totalHoursDone = completed.reduce((acc, b) => acc + (b.totalHours || 0), 0);
  const totalTattoos = realized.reduce((acc, b) => acc + b.tattoos.length, 0);

  return (
    <div className="max-w-5xl space-y-8">
      <Link href="/admin/clientes" className="eyebrow inline-flex items-center gap-2 hover:text-ink">
        <ArrowLeft className="h-3 w-3" /> Volver a clientes
      </Link>

      {/* Ficha */}
      <section className="border border-line bg-surface p-6 md:p-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow">Cliente</span>
            <h1 className="display-md mt-1">{client.name}</h1>
          </div>
          <Badge variant="muted">
            {list.length} reserva{list.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
          <InfoRow icon={Mail} label="Email" value={
            <a href={`mailto:${client.email}`} className="text-ink hover:underline">{client.email}</a>
          } />
          {client.phone && (
            <InfoRow icon={Phone} label="Teléfono" value={
              <a href={`tel:${client.phone.replace(/\s/g, "")}`} className="text-ink hover:underline">
                {client.phone}
              </a>
            } />
          )}
          {client.age > 0 && (
            <InfoRow icon={Hash} label="Edad" value={<span>{client.age} años</span>} />
          )}
          {sorted[sorted.length - 1]?.date && (
            <InfoRow icon={Calendar} label="Primer contacto" value={
              <span className="capitalize">{formatDateLong(sorted[sorted.length - 1].date)}</span>
            } />
          )}
        </div>
      </section>

      {/* KPIs del cliente */}
      <section className="grid sm:grid-cols-4 gap-4">
        <Stat label="Reservas realizadas" value={String(realized.length)} hint="confirmadas + completadas" />
        <Stat label="Horas completadas" value={formatHours(totalHoursDone)} hint={`${completed.length} sesiones`} />
        <Stat label="Tatuajes totales" value={String(totalTattoos)} />
        <Stat label="Invertido" value={formatCLP(totalSpent)} hint="total pagado" />
      </section>

      {/* Historial */}
      <section>
        <h2 className="eyebrow mb-4">Historial de reservas</h2>
        <div className="border border-line bg-surface divide-y divide-line">
          {sorted.map((b) => {
            const c = statusColor(b.status);
            const tNames = b.tattoos.map((t) => t.bodyPart).filter(Boolean).join(", ");
            return (
              <Link
                key={b.id}
                href={`/admin/citas/${b.id}`}
                className="p-4 sm:p-5 flex items-start gap-3 hover:bg-line/30 transition-colors"
              >
                <div className={cn("w-1 self-stretch border-l-4", c.border)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={cn(c.bg, c.text, "border-0")}>
                      {statusLabel(b.status)}
                    </Badge>
                    <span className="text-xs text-muted">#{b.id}</span>
                  </div>
                  <div className="font-display text-lg mt-1 capitalize">
                    {formatDateLong(b.date)}
                  </div>
                  <div className="text-xs text-ink-soft mt-0.5">
                    {b.startTime} – {b.endTime} · {formatHours(b.totalHours)} ·{" "}
                    {b.tattoos.length} tatuaje{b.tattoos.length === 1 ? "" : "s"}
                    {tNames && ` · ${tNames}`}
                  </div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="font-display text-xl">{formatCLP(b.totalPrice)}</div>
                  {b.depositPaid && (
                    <div className="text-xs text-[#3E5E3E]">✓ abono pagado</div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-editorial text-muted">{label}</div>
      <div className="flex items-center gap-2 mt-1 text-ink">
        <Icon className="h-3.5 w-3.5 text-muted" />
        {value}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-line bg-surface p-5">
      <div className="text-xs uppercase tracking-editorial text-muted">{label}</div>
      <div className="font-display text-2xl mt-2">{value}</div>
      {hint && <div className="text-xs text-muted mt-1">{hint}</div>}
    </div>
  );
}
