'use client';

import { useMovieSearch } from '@/hooks/useMovieSearch';
import { MovieCard } from './MovieCard';
import { SkeletonGrid } from './SkeletonCard';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

interface SearchResultsProps {
  query: string;
  page: number;
}

// Client component that takes over rendering when the user is in search mode.
// The listing page stays a Server Component for SSR — this component
// only mounts when a query is present in the URL.
export function SearchResults({ query, page }: SearchResultsProps) {
  const { data, isLoading, isError } = useMovieSearch(query, page);

  if (isLoading) {
    return <SkeletonGrid count={20} />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Search failed"
        message="Something went wrong fetching results. Please try again."
        action={{ label: 'Clear search', href: '/movies' }}
      />
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <EmptyState
        title="No results"
        message={`No movies matched "${query}". Try a different search term.`}
        action={{ label: 'Browse all movies', href: '/movies' }}
      />
    );
  }

  const totalPages = Math.min(data.total_pages, 500);

  return (
    <>
      <p className="text-slate-400 text-sm mb-4" aria-live="polite">
        {data.total_results.toLocaleString()} results for{' '}
        <span className="text-white font-medium">&ldquo;{query}&rdquo;</span>
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {data.results.map((movie, index) => (
          <MovieCard key={movie.id} movie={movie} priority={index < 4} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </>
  );
}
