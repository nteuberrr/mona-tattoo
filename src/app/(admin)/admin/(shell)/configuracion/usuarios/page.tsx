import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { UsersManager } from "@/components/admin/UsersManager";
import { fetchUsers } from "@/lib/users/sheets";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const users = await fetchUsers();

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/configuracion" className="eyebrow hover:text-ink">
            ← Configuración
          </Link>
          <h1 className="display-md mt-1">Usuarios</h1>
          <p className="text-sm text-ink-soft mt-2 max-w-2xl">
            Administra quiénes pueden entrar al panel. Las credenciales se
            guardan en la hoja <code>Usuarios</code> de tu Google Sheet. Mientras
            no haya usuarios, el login acepta las credenciales del archivo{" "}
            <code>.env</code> (fallback).
          </p>
        </div>
        <Badge variant="outline">Guarda en Google Sheets</Badge>
      </div>

      <UsersManager initial={users} />
    </div>
  );
}
