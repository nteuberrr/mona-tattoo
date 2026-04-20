import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScheduleEditor } from "@/components/admin/ScheduleEditor";
import { configValue, getConfig } from "@/lib/config/sheets";

export const dynamic = "force-dynamic";

export default async function HorariosPage() {
  const config = await getConfig();
  const initial = {
    lunes: configValue(config, "horario_lunes"),
    martes: configValue(config, "horario_martes"),
    miercoles: configValue(config, "horario_miercoles"),
    jueves: configValue(config, "horario_jueves"),
    viernes: configValue(config, "horario_viernes"),
    sabado: configValue(config, "horario_sabado"),
    domingo: configValue(config, "horario_domingo")
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/configuracion" className="eyebrow hover:text-ink">
            ← Configuración
          </Link>
          <h1 className="display-md mt-1">Horarios de atención</h1>
          <p className="text-sm text-ink-soft mt-2 max-w-2xl">
            Define qué días trabajas y los horarios para cada uno. Estos
            valores alimentan los slots disponibles del flujo de reserva.
          </p>
        </div>
        <Badge variant="outline">Guarda en Google Sheets</Badge>
      </div>

      <ScheduleEditor initial={initial} />
    </div>
  );
}
