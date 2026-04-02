// Detail page skeleton — mirrors the layout of the detail page
// so there's no jarring jump when content loads.
export default function MovieDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-40 bg-slate-800 rounded mb-6" />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster skeleton */}
        <div className="flex-shrink-0 w-full md:w-48 lg:w-56">
          <div className="aspect-[2/3] rounded-xl bg-slate-800" />
        </div>

        {/* Info skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-slate-800 rounded w-3/4" />
          <div className="h-4 bg-slate-800 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-slate-800 rounded-full" />
            <div className="h-6 w-16 bg-slate-800 rounded-full" />
            <div className="h-6 w-20 bg-slate-800 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-5/6" />
            <div className="h-3 bg-slate-800 rounded w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
