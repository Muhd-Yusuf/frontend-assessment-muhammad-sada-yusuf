import { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchPopularMovies, fetchMoviesByGenre, fetchGenres } from '@/lib/tmdb';
import { MovieCard } from '@/components/ui/MovieCard';
import { SkeletonGrid } from '@/components/ui/SkeletonCard';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { GenreFilter } from '@/components/ui/GenreFilter';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchResults } from '@/components/ui/SearchResults';

export const metadata: Metadata = {
  title: 'Browse Movies',
  description: 'Discover popular movies, search by title, and filter by genre.',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    genre?: string;
    query?: string;
  }>;
}

export default async function MoviesPage({ searchParams }: PageProps) {
  // searchParams is async in Next.js 15 — awaiting it before use
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const genreId = params.genre ? parseInt(params.genre, 10) : undefined;
  const query = params.query?.trim() ?? '';
  const isSearchMode = query.length > 0;

  // Genres are static enough to always fetch server-side and pass as props,
  // avoiding a client-side waterfall just to populate the filter dropdown.
  const genreList = await fetchGenres();

  // Only fetch listing data when not in search mode. In search mode the
  // SearchResults client component handles data fetching via TanStack Query.
  let movies = null;
  let totalPages = 1;

  if (!isSearchMode) {
    const data = genreId
      ? await fetchMoviesByGenre(genreId, page)
      : await fetchPopularMovies(page);
    movies = data.results;
    // TMDB caps at 500 pages even if total_pages is higher
    totalPages = Math.min(data.total_pages, 500);
  }

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Site header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <a
            href="/movies"
            className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            🎬 CineExplorer
          </a>
          <p className="text-xs text-slate-400 hidden sm:block">
            Powered by TMDB
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {isSearchMode
              ? `Results for "${query}"`
              : genreId
              ? genreList.genres.find((g) => g.id === genreId)?.name ?? 'Movies'
              : 'Popular Movies'}
          </h1>
        </div>

        {/* Search + filter bar — wrapped in Suspense because SearchInput
            reads useSearchParams which requires a Suspense boundary in Next.js */}
        <Suspense fallback={<div className="h-11 mb-8" />}>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <SearchInput className="flex-1" defaultValue={query} />
            <GenreFilter genres={genreList.genres} defaultGenre={params.genre} />
          </div>
        </Suspense>

        {/* Results */}
        {isSearchMode ? (
          // SearchResults is a client component that uses TanStack Query.
          // It takes over when a query is present — the listing page itself
          // stays a Server Component for everything else.
          <SearchResults query={query} page={page} />
        ) : movies && movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {movies.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  // First 4 cards are above the fold — mark as priority so
                  // next/image preloads them, improving LCP score.
                  priority={index < 4}
                />
              ))}
            </div>
            <Suspense>
              <Pagination currentPage={page} totalPages={totalPages} />
            </Suspense>
          </>
        ) : (
          <EmptyState
            title="No movies found"
            message="Try adjusting your genre filter."
            action={{ label: 'Clear filters', href: '/movies' }}
          />
        )}
      </div>
    </main>
  );
}
