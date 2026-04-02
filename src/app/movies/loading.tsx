import { SkeletonGrid } from '@/components/ui/SkeletonCard';

// loading.tsx auto-wraps the page in a Suspense boundary.
// Showing skeletons here instead of a spinner gives users a concrete
// preview of the layout before data arrives, reducing perceived load time.
export default function MoviesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mimic the search bar shape while loading */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 h-11 bg-slate-900 rounded-xl animate-pulse" />
        <div className="w-40 h-11 bg-slate-900 rounded-xl animate-pulse" />
      </div>
      <SkeletonGrid count={20} />
    </div>
  );
}
