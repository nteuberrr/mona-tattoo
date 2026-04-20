import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Calendar, Clock, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { statusColor, statusLabel } from "@/lib/mock-bookings";
import { getAllBookings } from "@/lib/bookings";
import { formatCLP, formatDateLong, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CitaDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { bookings } = await getAllBookings();
  const booking = bookings.find((b) => b.id === id);
  if (!booking) notFound();

  const c = statusColor(booking.status);

  return (
    <div className="max-w-4xl space-y-8">
      <Link href="/admin/agenda" className="eyebrow inline-flex items-center gap-2 hover:text-ink">
        <ArrowLeft className="h-3 w-3" /> Volver a agenda
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <Badge className={cn(c.bg, c.text, "border-0")}>
              {statusLabel(booking.status)}
            </Badge>
            <span className="text-xs text-muted">#{booking.id}</span>
          </div>
          <h1 className="display-md mt-3">{booking.client.name}</h1>
        </div>
      </div>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="border border-line bg-surface p-6">
          <span className="eyebrow">Cliente</span>
          <div className="mt-4 space-y-2 text-sm">
            <a href={`mailto:${booking.client.email}`} className="flex items-center gap-2 hover:text-ink">
              <Mail className="h-4 w-4 text-muted" /> {booking.client.email}
            </a>
            <a href={`tel:${booking.client.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-ink">
              <Phone className="h-4 w-4 text-muted" /> {booking.client.phone}
            </a>
            <div className="text-xs text-muted pt-1">{booking.client.age} años</div>
          </div>
        </div>

        <div className="border border-line bg-surface p-6">
          <span className="eyebrow">Cita</span>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted" />
              <span className="capitalize">{formatDateLong(booking.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted" />
              {booking.startTime} – {booking.endTime} · {booking.totalHours} h
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">
            Tatuajes ({booking.tattoos.length})
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {booking.tattoos.map((t, i) => (
            <div key={t.id} className="border border-line bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="eyebrow">#{i + 1} · {t.style}</span>
                <span className="font-display text-xl">{formatCLP(t.price)}</span>
              </div>
              <p className="mt-3 text-sm text-ink-soft">{t.description}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                <span>{t.widthCm} × {t.heightCm} cm</span>
                <span className="capitalize">· {t.bodyPart}</span>
                <span className="capitalize">· {t.color}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-ink bg-ink text-bg p-6">
        <div className="flex items-baseline justify-between gap-6">
          <span className="eyebrow !text-bg/60">Total</span>
          <span className="font-display text-3xl">{formatCLP(booking.totalPrice)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-6 mt-3 pt-3 border-t border-bg/20">
          <span className="text-bg/70 text-sm">
            Abono {booking.depositPaid ? "✓ pagado" : "pendiente"}
          </span>
          <span className="font-display text-xl">{formatCLP(booking.depositAmount)}</span>
        </div>
      </section>
    </div>
  );
}
