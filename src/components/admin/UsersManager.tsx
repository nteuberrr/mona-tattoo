"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Plus, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import type { AdminUser } from "@/lib/users/sheets";

export function UsersManager({ initial }: { initial: AdminUser[] }) {
  const router = useRouter();
  const [users, setUsers] = React.useState(initial);
  const [showPasswords, setShowPasswords] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => setUsers(initial), [initial]);

  const refresh = async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      setUsers(data.users ?? []);
      router.refresh();
    } catch {}
  };

  const removeUser = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar a "${nombre}"?`)) return;
    const prev = users;
    setUsers((u) => u.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setUsers(prev);
      alert("No se pudo eliminar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => setShowPasswords((v) => !v)}
          className="text-xs uppercase tracking-editorial text-ink-soft hover:text-ink inline-flex items-center gap-1.5"
        >
          {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"}
        </button>
        <Button size="sm" onClick={() => setAddOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
          {addOpen ? "Cerrar" : "Agregar usuario"}
        </Button>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger border border-danger/40 p-3 text-sm">
          {error}
        </div>
      )}

      {addOpen && (
        <AddUserForm
          onCancel={() => setAddOpen(false)}
          onSuccess={() => {
            setAddOpen(false);
            refresh();
          }}
          onError={setError}
        />
      )}

      <div className="border border-line bg-surface">
        {users.length === 0 ? (
          <div className="p-10 text-center text-muted text-sm">
            No hay usuarios. Mientras no crees ninguno, el login usa las env vars de Vercel
            como fallback.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {users.map((u) =>
              editingId === u.id ? (
                <EditUserRow
                  key={u.id}
                  user={u}
                  onCancel={() => setEditingId(null)}
                  onSuccess={() => {
                    setEditingId(null);
                    refresh();
                  }}
                  onError={setError}
                />
              ) : (
                <UserRow
                  key={u.id}
                  user={u}
                  showPassword={showPasswords}
                  onEdit={() => setEditingId(u.id)}
                  onDelete={() => removeUser(u.id, u.nombre)}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  showPassword,
  onEdit,
  onDelete
}: {
  user: AdminUser;
  showPassword: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-4 sm:p-5 flex flex-wrap items-start gap-4">
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg">{user.nombre}</span>
          {!user.activo && (
            <Badge variant="muted" className="text-[0.6rem]">
              Inactivo
            </Badge>
          )}
          <Badge variant="outline" className="text-[0.6rem] capitalize">
            {user.rol}
          </Badge>
        </div>
        <div className="text-xs text-ink-soft mt-1">{user.email}</div>
      </div>

      <div className="text-xs">
        <div className="text-muted uppercase tracking-editorial">Contraseña</div>
        <div className="font-mono mt-1">
          {showPassword ? user.password : "•".repeat(Math.max(user.password.length, 6))}
        </div>
      </div>

      {user.last_login && (
        <div className="text-xs">
          <div className="text-muted uppercase tracking-editorial">Último login</div>
          <div className="mt-1">{formatDateShort(user.last_login)}</div>
        </div>
      )}

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={onEdit}
          className="text-xs px-3 h-8 border border-line hover:border-ink transition-colors uppercase tracking-editorial"
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-muted hover:text-danger"
          aria-label="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function AddUserForm({
  onCancel,
  onSuccess,
  onError
}: {
  onCancel: () => void;
  onSuccess: () => void;
  onError: (e: string | null) => void;
}) {
  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    if (!nombre || !email || !password) {
      onError("Completa nombre, email y contraseña.");
      return;
    }
    setSaving(true);
    onError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      onSuccess();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="border border-ink bg-surface p-6">
      <h3 className="eyebrow mb-4">Nuevo usuario</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Nombre</Label>
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Contraseña</Label>
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-ink"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button size="sm" onClick={submit} disabled={saving}>
          {saving ? "Creando…" : "Crear usuario"}
        </Button>
      </div>
    </section>
  );
}

function EditUserRow({
  user,
  onCancel,
  onSuccess,
  onError
}: {
  user: AdminUser;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (e: string | null) => void;
}) {
  const [nombre, setNombre] = React.useState(user.nombre);
  const [email, setEmail] = React.useState(user.email);
  const [password, setPassword] = React.useState("");
  const [activo, setActivo] = React.useState(user.activo);
  const [showPw, setShowPw] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    setSaving(true);
    onError(null);
    try {
      const body: Record<string, unknown> = { nombre, email, activo };
      if (password.trim() !== "") body.password = password;
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      onSuccess();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 grid md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end bg-line/20">
      <div>
        <Label>Nombre</Label>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div>
        <Label>Email</Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label>Nueva contraseña (dejar vacío para mantener)</Label>
        <div className="relative">
          <Input
            type={showPw ? "text" : "password"}
            value={password}
            placeholder="•••••"
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-ink"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-2 text-xs">
          <Checkbox checked={activo} onCheckedChange={(v) => setActivo(!!v)} />
          {activo ? "Activo" : "Inactivo"}
        </label>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onCancel}
          className="p-2 text-muted hover:text-ink"
          aria-label="Cancelar"
        >
          <X className="h-4 w-4" />
        </button>
        <Button size="sm" onClick={submit} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
