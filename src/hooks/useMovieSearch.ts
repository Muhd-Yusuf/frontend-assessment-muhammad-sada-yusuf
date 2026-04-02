'use client';

import { useQuery } from '@tanstack/react-query';
import type { MovieListResponse } from '@/types/tmdb';

// TanStack Query wrapper for client-side search. Using TQ here instead of
// plain fetch + useState because: automatic loading/error state, request
// deduplication, and background refetch on window focus out of the box.
export function useMovieSearch(query: string, page: number) {
  return useQuery<MovieListResponse, Error>({
    queryKey: ['movies', 'search', query, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        query,
        page: String(page),
      });
      const res = await fetch(`/api/movies/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search request failed');
      return res.json() as Promise<MovieListResponse>;
    },
    // Don't fire the query until there's something to search for.
    enabled: query.trim().length > 0,
    // Keep previous results visible while fetching the next page, avoiding
    // a flash of empty content on pagination.
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}
