import { AdminShell } from "@/components/layout/AdminSidebar";

export default function AdminShellLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
