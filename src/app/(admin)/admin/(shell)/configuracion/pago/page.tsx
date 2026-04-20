import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function PagoPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/configuracion" className="eyebrow hover:text-ink">
            ← Configuración
          </Link>
          <h1 className="display-md mt-1">Datos de pago</h1>
        </div>
        <Badge variant="outline">Fase 2 · en construcción</Badge>
      </div>
      <div className="border border-line bg-surface p-10 text-ink-soft space-y-2">
        <p>
          Formulario para editar titular, RUT, banco, tipo de cuenta, número y
          email de contacto. Más la configuración del abono (monto fijo o %).
        </p>
        <p>
          Mientras tanto los valores están hardcodeados en{" "}
          <code className="text-ink">Step5Transfer.tsx</code> y usan el mock.
        </p>
      </div>
    </div>
  );
}
