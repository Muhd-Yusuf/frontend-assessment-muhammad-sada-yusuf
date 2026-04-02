// Skeleton loader that matches the exact shape of MovieCard.
// Using a shimmer animation instead of a spinner gives the user a sense
// of where content will land, which reduces perceived load time.
export function SkeletonCard() {
  return (
    <div
      className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800"
      aria-hidden="true"
    >
      {/* Poster placeholder — same 2:3 aspect ratio as the real card */}
      <div className="relative aspect-[2/3] bg-slate-800 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" />
      </div>
      {/* Title and meta placeholders */}
      <div className="p-3 space-y-2">
        <div className="h-3 bg-slate-800 rounded-full w-4/5 overflow-hidden">
          <div className="h-full -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" />
        </div>
        <div className="h-3 bg-slate-800 rounded-full w-2/5 overflow-hidden">
          <div className="h-full -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}

// Grid of skeletons — used in loading.tsx for the listing page
export function SkeletonGrid({ count = 20 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
