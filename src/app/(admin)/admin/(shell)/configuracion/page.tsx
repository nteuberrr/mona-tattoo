import Link from "next/link";
import { ArrowRight, Table2, Clock, CalendarX, CreditCard } from "lucide-react";

const SECTIONS = [
  {
    href: "/admin/configuracion/precios",
    icon: Table2,
    title: "Tabla de precios",
    body: "Sube tu Excel con precios por dimensión y estilo. Alimenta la cotización automática del flujo de reserva."
  },
  {
    href: "/admin/configuracion/horas",
    icon: Clock,
    title: "Matriz de horas",
    body: "Define cuánto demora cada combinación de ancho × alto, separado por estilo (lineal / realista)."
  },
  {
    href: "/admin/configuracion/horarios",
    icon: CalendarX,
    title: "Horarios de atención",
    body: "Define los horarios default por día de la semana (Lun–Dom)."
  },
  {
    href: "/admin/configuracion/bloqueos",
    icon: CalendarX,
    title: "Bloqueos de agenda",
    body: "Feriados, vacaciones o franjas puntuales en las que no recibes reservas."
  },
  {
    href: "/admin/configuracion/pago",
    icon: CreditCard,
    title: "Datos de pago",
    body: "Cuenta bancaria que ven los clientes en el paso 5, más modo/valor del abono."
  }
];

export default function ConfiguracionIndex() {
  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <span className="eyebrow">Configuración</span>
        <h1 className="display-md mt-1">Ajustes del estudio</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group border border-line bg-surface p-6 hover:border-ink transition-colors"
            >
              <div className="flex items-start justify-between">
                <Icon className="h-5 w-5 text-ink" />
                <ArrowRight className="h-4 w-4 text-muted group-hover:text-ink transition-colors" />
              </div>
              <h2 className="font-display text-2xl mt-5">{s.title}</h2>
              <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
