import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DiscountEditor } from "@/components/admin/DiscountEditor";
import { configValue, getConfig } from "@/lib/config/sheets";

export const dynamic = "force-dynamic";

export default async function DescuentosPage() {
  const config = await getConfig();
  const initial = {
    multiTattooActive:
      String(configValue(config, "descuento_multi_tatuaje_activo")).toUpperCase() === "TRUE",
    multiTattooPct: Number(configValue(config, "descuento_multi_tatuaje_pct")) || 0
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/configuracion" className="eyebrow hover:text-ink">
            ← Configuración
          </Link>
          <h1 className="display-md mt-1">Descuentos</h1>
          <p className="text-sm text-ink-soft mt-2 max-w-2xl">
            Reglas de descuentos que se aplican automáticamente al cotizar.
          </p>
        </div>
        <Badge variant="outline">Guarda en Google Sheets</Badge>
      </div>

      <DiscountEditor initial={initial} />
    </div>
  );
}
