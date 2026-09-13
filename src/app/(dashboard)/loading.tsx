export default function DashboardGlobalLoading() {
  return (
    <div className="w-full h-full p-6 sm:p-8 font-sans text-zinc-900 bg-white">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-200">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-zinc-100 rounded-md animate-pulse" />
            <div className="h-7 w-56 bg-zinc-200/70 rounded-lg animate-pulse" />
            <div className="h-3 w-80 bg-zinc-100 rounded-md animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-zinc-100 rounded-xl animate-pulse" />
            <div className="h-9 w-24 bg-zinc-100 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Action / Metric Skeleton Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-zinc-200/80 bg-[#fbfcfd] space-y-2.5 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-zinc-200/70 rounded" />
                <div className="w-5 h-5 bg-zinc-100 rounded-md" />
              </div>
              <div className="h-7 w-24 bg-zinc-200/80 rounded" />
              <div className="h-2.5 w-32 bg-zinc-100 rounded" />
            </div>
          ))}
        </div>

        {/* Content Body Skeleton */}
        <div className="p-6 rounded-2xl border border-zinc-200/80 bg-white space-y-4 animate-pulse">
          <div className="h-5 w-48 bg-zinc-200/70 rounded" />
          <div className="space-y-2.5 pt-2">
            <div className="h-10 w-full bg-zinc-50 border border-zinc-100 rounded-xl" />
            <div className="h-10 w-full bg-zinc-50 border border-zinc-100 rounded-xl" />
            <div className="h-10 w-full bg-zinc-50 border border-zinc-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
