import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminShellLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
