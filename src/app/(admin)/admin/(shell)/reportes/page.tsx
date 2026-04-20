import { format, parseISO, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { getAllBookings } from "@/lib/bookings";
import type { Booking } from "@/lib/mock-bookings";
import { formatCLP, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const { bookings, source } = await getAllBookings();

  // Filtrar solo las que cuentan como "venta realizada"
  const realized = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
  );

  const now = new Date();
  const last12Months = eachMonthOfInterval({
    start: subMonths(startOfMonth(now), 11),
    end: startOfMonth(now)
  });

  // Ingresos por mes (últimos 12)
  const incomeByMonth = last12Months.map((month) => {
    const ms = startOfMonth(month).getTime();
    const me = endOfMonth(month).getTime();
    const bs = realized.filter((b) => {
      if (!b.date) return false;
      const t = parseISO(b.date).getTime();
      return t >= ms && t <= me;
    });
    return {
      label: format(month, "MMM yy", { locale: es }),
      value: bs.reduce((acc, b) => acc + (b.totalPrice || 0), 0),
      count: bs.length
    };
  });

  const maxIncome = Math.max(1, ...incomeByMonth.map((m) => m.value));

  // Totales
  const totalIncome = realized.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const totalSessions = realized.length;
  const avgPerTattoo = (() => {
    const allTattoos = realized.flatMap((b) => b.tattoos);
    if (allTattoos.length === 0) return 0;
    const sum = allTattoos.reduce((acc, t) => acc + (t.price || 0), 0);
    return Math.round(sum / allTattoos.length);
  })();

  // Top zonas del cuerpo
  const byBodyPart = aggregateBy(realized, (b) => b.tattoos.map((t) => t.bodyPart));
  // Top estilos
  const byStyle = aggregateBy(realized, (b) => b.tattoos.map((t) => t.style));
  // Por color
  const byColor = aggregateBy(realized, (b) => b.tattoos.map((t) => t.color));

  // Tasa de solicitudes especiales
  const specialTattoos = realized.flatMap((b) => b.tattoos).filter((t) => t.description && t.bodyPart).length;
  const totalTattoos = realized.flatMap((b) => b.tattoos).length;

  return (
    <div className="max-w-6xl space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">Analítica</span>
          <h1 className="display-md mt-1">Reportes</h1>
          <p className="text-sm text-ink-soft mt-2">
            Calculado sobre reservas en estado <em>Confirmada</em> o{" "}
            <em>Completada</em>.
          </p>
        </div>
        <Badge variant={source === "sheets" ? "outline" : "muted"}>
          {source === "sheets" ? "Google Sheets · en vivo" : "Mock local"}
        </Badge>
      </div>

      <section className="grid sm:grid-cols-3 gap-4">
        <Stat label="Ingresos totales" value={formatCLP(totalIncome)} />
        <Stat label="Sesiones realizadas" value={String(totalSessions)} />
        <Stat label="Promedio por tatuaje" value={formatCLP(avgPerTattoo)} />
      </section>

      <section className="border border-line bg-surface p-6">
        <h2 className="eyebrow mb-5">Ingresos últimos 12 meses</h2>
        <div className="flex items-end gap-2 h-48">
          {incomeByMonth.map((m, i) => {
            const pct = (m.value / maxIncome) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={cn(
                      "w-full bg-ink transition-all",
                      m.value === 0 && "bg-line"
                    )}
                    style={{ height: `${Math.max(pct, 1)}%` }}
                    title={`${formatCLP(m.value)} · ${m.count} sesiones`}
                  />
                </div>
                <div className="text-[0.6rem] uppercase tracking-editorial text-muted capitalize">
                  {m.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <Ranking title="Zonas del cuerpo" items={byBodyPart.slice(0, 5)} />
        <Ranking title="Estilos" items={byStyle} />
        <Ranking title="Colores" items={byColor} />
      </section>

      <section className="border border-line bg-surface p-6">
        <h2 className="eyebrow mb-3">Totales</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="text-xs uppercase tracking-editorial text-muted">Tatuajes</div>
            <div className="font-display text-2xl mt-1">{totalTattoos}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-editorial text-muted">Clientes únicos</div>
            <div className="font-display text-2xl mt-1">
              {new Set(realized.map((b) => b.client.email || b.client.name)).size}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-editorial text-muted">Promedio h/sesión</div>
            <div className="font-display text-2xl mt-1">
              {realized.length === 0
                ? "—"
                : (
                    realized.reduce((acc, b) => acc + (b.totalHours || 0), 0) /
                    realized.length
                  ).toFixed(1) + " h"}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-editorial text-muted">Promedio $ / sesión</div>
            <div className="font-display text-2xl mt-1">
              {realized.length === 0
                ? "—"
                : formatCLP(Math.round(totalIncome / realized.length))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-surface p-5">
      <div className="text-xs uppercase tracking-editorial text-muted">{label}</div>
      <div className="font-display text-2xl mt-2">{value}</div>
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
                <div
                  className="h-full bg-ink"
                  style={{ width: `${(i.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function aggregateBy(
  bookings: Booking[],
  extract: (b: Booking) => string[]
): { key: string; count: number }[] {
  const map = new Map<string, number>();
  for (const b of bookings) {
    for (const key of extract(b)) {
      if (!key) continue;
      const k = String(key).toLowerCase();
      map.set(k, (map.get(k) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}
