import Link from "next/link";
import { callSheets, isSheetsConfigured } from "@/lib/sheets/client";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const configured = isSheetsConfigured();
  const pricing = configured ? await callSheets("getPricing") : null;
  const config = configured ? await callSheets("getConfig") : null;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <span className="eyebrow">Diagnóstico</span>
        <h1 className="display-md mt-1">Webhook inspector</h1>
        <p className="text-sm text-ink-soft mt-2">
          Muestra la respuesta cruda que devuelve el Apps Script. Útil para
          verificar que el Sheet se lea correctamente.
        </p>
      </div>

      <section className="border border-line bg-surface p-6">
        <h2 className="eyebrow mb-3">Estado</h2>
        <div className="text-sm">
          <div>
            <strong>Sheets configurado:</strong>{" "}
            {configured ? "✓ sí" : "✗ no (faltan env vars)"}
          </div>
        </div>
      </section>

      <section className="border border-line bg-surface p-6">
        <h2 className="eyebrow mb-3">getPricing</h2>
        <pre className="text-xs overflow-x-auto bg-bg p-4 border border-line max-h-[500px] overflow-y-auto">
          {JSON.stringify(pricing, null, 2)}
        </pre>
      </section>

      <section className="border border-line bg-surface p-6">
        <h2 className="eyebrow mb-3">getConfig</h2>
        <pre className="text-xs overflow-x-auto bg-bg p-4 border border-line max-h-[400px] overflow-y-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </section>

      <Link href="/admin/configuracion" className="inline-block text-xs uppercase tracking-editorial underline">
        ← Volver a configuración
      </Link>
    </div>
  );
}
