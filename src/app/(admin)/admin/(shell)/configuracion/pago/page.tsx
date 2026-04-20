import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PaymentEditor } from "@/components/admin/PaymentEditor";
import { configValue, getConfig } from "@/lib/config/sheets";

export const dynamic = "force-dynamic";

export default async function PagoPage() {
  const config = await getConfig();
  const initial = {
    banco_titular: configValue(config, "banco_titular"),
    banco_rut: configValue(config, "banco_rut"),
    banco_nombre: configValue(config, "banco_nombre"),
    banco_cuenta_tipo: configValue(config, "banco_cuenta_tipo"),
    banco_cuenta_numero: configValue(config, "banco_cuenta_numero"),
    banco_email_comprobante: configValue(config, "banco_email_comprobante"),
    deposito_modo: configValue(config, "deposito_modo"),
    deposito_valor: configValue(config, "deposito_valor"),
    estudio_direccion: configValue(config, "estudio_direccion"),
    instagram: configValue(config, "instagram")
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/configuracion" className="eyebrow hover:text-ink">
            ← Configuración
          </Link>
          <h1 className="display-md mt-1">Datos de pago</h1>
          <p className="text-sm text-ink-soft mt-2 max-w-2xl">
            Estos datos aparecen en el paso 5 del flujo de reserva. Asegúrate
            de que el titular y número de cuenta estén correctos — los clientes
            transfieren a estos datos.
          </p>
        </div>
        <Badge variant="outline">Guarda en Google Sheets</Badge>
      </div>

      <PaymentEditor initial={initial} />
    </div>
  );
}
