import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex gap-3 h-screen w-full p-3 overflow-hidden bg-[#0d0f14] text-foreground font-sans">
      {/* Ghost Background Gradient Wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: "linear-gradient(135deg, #008dee 0%, #0179e9 40%, #fa4700 80%, #111215 100%)",
        }}
        aria-hidden="true"
      />

      {/* CRT Scanline Shader */}
      <div className="ghost-tv-lines opacity-60" aria-hidden="true" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area in Blueprint Panel styling */}
      <main className="flex-1 overflow-y-auto relative rounded-2xl bg-[#f8fbfe] border border-[#006ddf]/20 shadow-2xl z-10 scroll-smooth">
        {children}
      </main>
    </div>
  );
}
