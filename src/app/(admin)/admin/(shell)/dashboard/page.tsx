import Link from "next/link";
import { addDays, endOfMonth, format, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { statusColor, type Booking } from "@/lib/mock-bookings";
import { getAllBookings } from "@/lib/bookings";
import { formatCLP, cn, formatDateShort, formatHours } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { bookings, source } = await getAllBookings();

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 7);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const pending = bookings.filter((b) => b.status === "PENDING_CONFIRMATION");

  const thisMonth = bookings.filter((b) => {
    if (!b.date) return false;
    const d = parseISO(b.date);
    return d >= monthStart && d <= monthEnd;
  });
  const monthRealized = thisMonth.filter(
    (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
  );
  const monthCompleted = thisMonth.filter((b) => b.status === "COMPLETED");

  const monthIncome = monthRealized.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const monthHoursDone = monthCompleted.reduce((acc, b) => acc + (b.totalHours || 0), 0);

  const proximas = bookings
    .filter((b) => b.status === "CONFIRMED" && b.date && parseISO(b.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 5);

  // Agregaciones globales (lifetime)
  const allRealized = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
  );
  const allTattoos = allRealized.flatMap((b) => b.tattoos);
  const uniqueClients = new Set(
    allRealized.map((b) => (b.client.email || b.client.name || "").toLowerCase())
  ).size;

  const avgPrice = allTattoos.length
    ? Math.round(allTattoos.reduce((a, t) => a + (t.price || 0), 0) / allTattoos.length)
    : 0;
  const avgSize = allTattoos.length
    ? allTattoos.reduce((a, t) => a + (t.widthCm || 0) * (t.heightCm || 0), 0) / allTattoos.length
    : 0;

  const byBody = aggregate(allTattoos, (t) => t.bodyPart);
  const byStyle = aggregate(allTattoos, (t) => t.style);

  const kpis = [
    {
      label: "Reservas este mes",
      value: String(monthRealized.length),
      hint: `${monthCompleted.length} completadas`
    },
    {
      label: "Venta total del mes",
      value: formatCLP(monthIncome),
      hint: monthRealized.length > 0 ? "confirmadas + completadas" : "sin ventas aún"
    },
    {
      label: "Horas realizadas",
      value: formatHours(monthHoursDone),
      hint: `${monthCompleted.length} sesiones cerradas`
    },
    {
      label: "Pendientes de confirmar",
      value: String(pending.length),
      hint: pending.length > 0 ? "requieren acción" : "al día ✦"
    }
  ];

  return (
    <div className="space-y-10 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">Panel · {format(today, "MMMM yyyy", { locale: es })}</span>
          <h1 className="display-md mt-1 capitalize">Dashboard</h1>
        </div>
        <Badge variant={source === "sheets" ? "outline" : "muted"}>
          {source === "sheets" ? "Google Sheets · en vivo" : "Mock local"}
        </Badge>
      </div>

      {pending.length > 0 && (
        <div className="bg-[#F6E6C4] text-[#6B5217] border border-[#D9B860] p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm">
              Tienes <strong>{pending.length}</strong> reserva
              {pending.length === 1 ? "" : "s"} pendiente
              {pending.length === 1 ? "" : "s"} de confirmar.
            </span>
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link href="/admin/agenda">Ver en agenda →</Link>
          </Button>
        </div>
      )}

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="border border-line bg-surface p-5">
            <div className="text-xs uppercase tracking-editorial text-muted">{k.label}</div>
            <div className="font-display text-3xl mt-2">{k.value}</div>
            <div className="text-xs text-muted mt-1">{k.hint}</div>
          </div>
        ))}
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="border border-line bg-surface p-5">
          <div className="text-xs uppercase tracking-editorial text-muted">Clientes únicos</div>
          <div className="font-display text-3xl mt-2">{uniqueClients}</div>
          <div className="text-xs text-muted mt-1">histórico</div>
        </div>
        <div className="border border-line bg-surface p-5">
          <div className="text-xs uppercase tracking-editorial text-muted">Precio promedio por tatuaje</div>
          <div className="font-display text-3xl mt-2">{formatCLP(avgPrice)}</div>
          <div className="text-xs text-muted mt-1">{allTattoos.length} tatuajes</div>
        </div>
        <div className="border border-line bg-surface p-5">
          <div className="text-xs uppercase tracking-editorial text-muted">Tamaño promedio</div>
          <div className="font-display text-3xl mt-2">{avgSize > 0 ? `${avgSize.toFixed(1)} cm²` : "—"}</div>
          <div className="text-xs text-muted mt-1">área (ancho × alto)</div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <ProximasCitas citas={proximas} />
        <div className="space-y-6">
          <Ranking title="Zonas del cuerpo" items={byBody.slice(0, 5)} />
          <Ranking title="Estilos" items={byStyle} />
        </div>
      </section>
    </div>
  );
}

function ProximasCitas({ citas }: { citas: Booking[] }) {
  return (
    <div className="border border-line bg-surface p-6">
      <h2 className="font-display text-2xl">Próximas citas</h2>
      <p className="text-xs text-muted mt-1">Confirmadas, ordenadas por fecha</p>
      <div className="mt-5 space-y-3">
        {citas.length === 0 && (
          <p className="text-sm text-muted py-6 text-center">Sin citas próximas.</p>
        )}
        {citas.map((b) => {
          const c = statusColor(b.status);
          return (
            <Link
              key={b.id}
              href={`/admin/citas/${b.id}`}
              className="flex items-center gap-3 hover:bg-line/30 -mx-3 px-3 py-2 transition-colors"
            >
              <div className={cn("w-1 h-10 border-l-4", c.border)} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{b.client.name}</div>
                <div className="text-xs text-muted capitalize">
                  {formatDateShort(b.date)} · {b.startTime}
                </div>
              </div>
              <div className="text-sm font-display">{formatCLP(b.totalPrice)}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Ranking({
  title,
  items
}: {
  title: string;
  items: { key: string; count: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="border border-line bg-surface p-6">
      <h3 className="eyebrow mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Sin datos todavía.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.key}>
              <div className="flex justify-between text-sm">
                <span className="capitalize">{i.key}</span>
                <span className="text-muted">{i.count}</span>
              </div>
              <div className="mt-1 h-1 bg-line">
                <div className="h-full bg-ink" style={{ width: `${(i.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function aggregate<T>(items: T[], extract: (x: T) => string): { key: string; count: number }[] {
  const m = new Map<string, number>();
  for (const it of items) {
    const k = String(extract(it) ?? "").toLowerCase().trim();
    if (!k) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return Array.from(m.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}
