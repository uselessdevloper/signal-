import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 h-screen w-full p-3 overflow-hidden bg-[oklch(0.965_0.008_264)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative bg-white rounded-2xl border border-[oklch(0.88_0.01_264)] shadow-sm">
        {children}
      </main>
    </div>
  );
}
