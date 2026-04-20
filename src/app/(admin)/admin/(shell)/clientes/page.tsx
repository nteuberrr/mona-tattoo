import { Badge } from "@/components/ui/badge";

export default function ClientesPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">Registro</span>
          <h1 className="display-md mt-1">Clientes</h1>
        </div>
        <Badge variant="outline">Fase 2 · en construcción</Badge>
      </div>
      <div className="border border-line bg-surface p-10 text-ink-soft">
        Listado con búsqueda por nombre / email / teléfono e historial de cada cliente.
      </div>
    </div>
  );
}
