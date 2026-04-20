import { callSheets, isSheetsConfigured } from "@/lib/sheets/client";

export type AdminUser = {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  activo: boolean;
  created_at?: string;
  last_login?: string;
};

export type NewUserInput = {
  nombre: string;
  email: string;
  password: string;
  rol?: string;
  activo?: boolean;
};

export type UpdateUserInput = {
  id: string;
  nombre?: string;
  email?: string;
  password?: string;
  rol?: string;
  activo?: boolean;
};

type RawUser = {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  activo: boolean | string;
  created_at?: string;
  last_login?: string;
};

function normalize(raw: RawUser): AdminUser {
  return {
    id: String(raw.id),
    nombre: String(raw.nombre ?? ""),
    email: String(raw.email ?? ""),
    password: String(raw.password ?? ""),
    rol: String(raw.rol ?? "admin"),
    activo:
      typeof raw.activo === "boolean"
        ? raw.activo
        : String(raw.activo ?? "").toUpperCase() === "TRUE",
    created_at: raw.created_at ? String(raw.created_at) : undefined,
    last_login: raw.last_login ? String(raw.last_login) : undefined
  };
}

export async function fetchUsers(): Promise<AdminUser[]> {
  if (!isSheetsConfigured()) return [];
  const res = await callSheets<{ users: RawUser[] }>("getUsers");
  if (!res.ok) {
    console.error("[users] getUsers falló:", res.error);
    return [];
  }
  return (res.data.users ?? []).map(normalize);
}

export async function createUserAction(input: NewUserInput): Promise<{ ok: boolean; error?: string }> {
  if (!isSheetsConfigured()) return { ok: false, error: "Sheets no configurado" };
  const res = await callSheets("createUser", input as unknown as Record<string, unknown>);
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}

export async function updateUserAction(input: UpdateUserInput): Promise<{ ok: boolean; error?: string }> {
  if (!isSheetsConfigured()) return { ok: false, error: "Sheets no configurado" };
  const res = await callSheets("updateUser", input as unknown as Record<string, unknown>);
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}

export async function deleteUserAction(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSheetsConfigured()) return { ok: false, error: "Sheets no configurado" };
  const res = await callSheets("deleteUser", { id });
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}

/** Valida credenciales en la Sheet. Retorna user mínimo si match. */
export async function validateUserAction(
  email: string,
  password: string
): Promise<{ user: { email: string; nombre: string } | null; sheetHasUsers: boolean }> {
  if (!isSheetsConfigured()) return { user: null, sheetHasUsers: false };
  const res = await callSheets<{ user?: { email: string; nombre: string } }>(
    "validateUser",
    { email, password }
  );
  if (res.ok && res.data.user) {
    return { user: res.data.user, sheetHasUsers: true };
  }
  // Si falló pero porque no encontró match, aún consideramos que la Sheet existe
  // y tiene usuarios. Saber esto ayuda a decidir si el fallback a env vars
  // debe permitirse (solo cuando Sheet está vacía).
  const users = await fetchUsers();
  return { user: null, sheetHasUsers: users.length > 0 };
}
