import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mesh-bg flex gap-3 h-screen w-full p-3 overflow-hidden">
      {/* Animated floating colour orbs */}
      <div className="mesh-orbs" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>

      <Sidebar />

      <main className="dashboard-surface flex-1 overflow-y-auto relative rounded-2xl z-10">
        {children}
      </main>
    </div>
  );
}
