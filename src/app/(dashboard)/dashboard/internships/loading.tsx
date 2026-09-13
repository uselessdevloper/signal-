import { Briefcase, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full min-h-full p-6 sm:p-10 font-sans text-zinc-900 bg-white">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-200">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-zinc-100 rounded-md animate-pulse" />
            <div className="h-8 w-64 bg-zinc-200/70 rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-zinc-100 rounded-md animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 bg-zinc-100 rounded-xl animate-pulse" />
            <div className="h-9 w-24 bg-zinc-100 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Filter Bar Skeleton */}
        <div className="h-12 w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl animate-pulse" />

        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-2xs space-y-4 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-36 bg-zinc-200/80 rounded" />
                    <div className="h-3 w-24 bg-zinc-100 rounded" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-emerald-50 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-zinc-100 rounded" />
                <div className="h-3 w-3/4 bg-zinc-100 rounded" />
              </div>
              <div className="flex gap-2 pt-2 border-t border-zinc-100">
                <div className="h-6 w-20 bg-zinc-100 rounded-lg" />
                <div className="h-6 w-16 bg-zinc-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
