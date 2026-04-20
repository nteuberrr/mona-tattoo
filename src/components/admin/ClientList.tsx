"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCLP, formatDateLong } from "@/lib/utils";
import type { ClientSummary } from "@/lib/clients";

export function ClientList({ clients }: { clients: ClientSummary[] }) {
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!q.trim()) return clients;
    const needle = q.trim().toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle) ||
        c.phone.toLowerCase().includes(needle)
    );
  }, [clients, q]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          placeholder="Buscar por nombre, email o teléfono"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-6"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="border border-line bg-surface p-10 text-center text-muted text-sm">
          {clients.length === 0
            ? "Todavía no hay clientes. Aparecen aquí cuando se registra la primera reserva."
            : "Sin resultados para tu búsqueda."}
        </div>
      ) : (
        <div className="border border-line bg-surface divide-y divide-line">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/admin/clientes/${encodeURIComponent(c.id)}`}
              className="p-4 sm:p-5 flex items-start gap-4 hover:bg-line/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-display text-xl truncate">{c.name}</div>
                <div className="text-xs text-ink-soft mt-1 flex flex-wrap gap-x-3">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {c.email}
                  </span>
                  {c.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </span>
                  )}
                </div>
                {c.lastBooking && (
                  <div className="text-xs text-muted mt-2 capitalize">
                    Última cita: {formatDateLong(c.lastBooking)}
                  </div>
                )}
              </div>
              <div className="text-right whitespace-nowrap">
                <div className="text-xs text-muted uppercase tracking-editorial">
                  {c.totalBookings} reserva{c.totalBookings === 1 ? "" : "s"}
                </div>
                <div className="font-display text-xl mt-1">
                  {formatCLP(c.totalSpent)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="text-xs text-muted">
        {filtered.length} cliente{filtered.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}
