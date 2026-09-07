import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#f4f5f7] text-zinc-900 font-sans antialiased">
      {/* Multica Style Sidebar */}
      <Sidebar />

      {/* Main Workspace Viewport */}
      <main className="flex-1 overflow-y-auto relative bg-[#ffffff] m-2 ml-0 rounded-2xl border border-zinc-200/80 shadow-sm z-10 scroll-smooth">
        {children}
      </main>
    </div>
  );
}
