import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  // Fase 1.5 — data mockeada. Fase 2 lee de Prisma.
  const pendientes = 0;
  const kpis = [
    { label: "Reservas esta semana", value: "0", hint: "— pendiente conectar DB" },
    { label: "Ingresos del mes", value: "—", hint: "—" },
    { label: "Próxima cita", value: "Sin datos", hint: "—" },
    { label: "Solicitudes especiales", value: "0", hint: "—" }
  ];

  return (
    <div className="space-y-10 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">Panel</span>
          <h1 className="display-md mt-1">Dashboard</h1>
        </div>
        <Badge variant="outline">Fase 1.5 · sin DB</Badge>
      </div>

      {pendientes > 0 && (
        <div className="bg-[#F6E6C4] text-[#6B5217] px-5 py-4 flex items-center justify-between">
          <span className="text-sm">
            Tienes <strong>{pendientes}</strong> reservas pendientes de confirmar.
          </span>
          <Link href="/admin/agenda" className="text-xs uppercase tracking-editorial underline">
            Ver ahora →
          </Link>
        </div>
      )}

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="border border-line bg-surface p-5">
            <div className="text-xs uppercase tracking-editorial text-muted">
              {k.label}
            </div>
            <div className="font-display text-3xl mt-2">{k.value}</div>
            <div className="text-xs text-muted mt-1">{k.hint}</div>
          </div>
        ))}
      </section>

      <section className="border border-line bg-surface p-8">
        <h2 className="font-display text-2xl">Empieza por acá</h2>
        <p className="mt-2 text-ink-soft max-w-xl">
          Antes de recibir reservas reales, sube tu tabla de precios y tu
          matriz de horas. Esto alimenta la cotización y el cálculo de slots
          del flujo público.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/configuracion/precios">Subir tabla de precios</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/configuracion/horas">Ver matriz de horas</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
