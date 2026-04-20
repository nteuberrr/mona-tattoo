"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Cerrar el drawer al navegar
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg md:flex">
      {/* Topbar mobile */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/95 backdrop-blur px-4 h-14">
        <Link href="/admin/dashboard" className="font-display text-lg">
          Mona Tatt ✦
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -mr-2"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Backdrop mobile */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
          aria-label="Cerrar menú"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-screen w-72 md:w-60 lg:w-64 shrink-0 flex flex-col border-r border-line bg-surface transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-line flex items-center justify-between">
          <div>
            <Link href="/admin/dashboard" className="font-display text-xl">
              Mona Tatt ✦
            </Link>
            <div className="text-[0.65rem] uppercase tracking-editorial text-muted mt-1">
              Panel admin
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 -mr-2"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-ink text-bg"
                    : "text-ink-soft hover:bg-line/50 hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-line">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-ink-soft hover:text-ink w-full"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <main className="p-4 sm:p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
