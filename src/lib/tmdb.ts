// Central API client for TMDB. All fetch calls go through here — components
// never call fetch() directly. This keeps the API surface in one file,
// makes it easy to mock in tests, and means cache settings are documented
// alongside the functions that use them.

import type {
  MovieListResponse,
  MovieDetail,
  GenreListResponse,
  Credits,
} from '@/types/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Fail early and clearly if the key is missing rather than letting a
// cryptic 401 surface deep in a component render.
function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      'TMDB_API_KEY is not set. Copy .env.example → .env.local and add your key.'
    );
  }
  return key;
}

async function tmdbFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const key = getApiKey();
  const url = `${TMDB_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      // Bearer token is the modern TMDB auth method (v4 style on v3 endpoints).
      // More secure than query-string api_key which shows up in server logs.
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(
      `TMDB API error ${res.status} on ${endpoint}: ${res.statusText}`
    );
  }

  return res.json() as Promise<T>;
}

// revalidate: 300 (5 min) — the popular list shifts slowly enough that
// 5-minute caching gives a good perf win without showing stale data.
export async function fetchPopularMovies(page = 1): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>(
    `/movie/popular?language=en-US&page=${page}`,
    { next: { revalidate: 300 } }
  );
}

// Genre-filtered browsing uses the same 5-min cache as popular movies.
export async function fetchMoviesByGenre(
  genreId: number,
  page = 1
): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>(
    `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}&language=en-US`,
    { next: { revalidate: 300 } }
  );
}

// revalidate: 86400 (24 h) — movie metadata (title, runtime, cast) almost
// never changes after a film is released, so a full day of caching is safe.
export async function fetchMovieDetail(id: number): Promise<MovieDetail> {
  return tmdbFetch<MovieDetail>(`/movie/${id}?language=en-US`, {
    next: { revalidate: 86400 },
  });
}

// Credits are fetched separately from detail data so they can be wrapped
// in a Suspense boundary and streamed in after the above-fold content lands.
export async function fetchMovieCredits(id: number): Promise<Credits> {
  return tmdbFetch<Credits>(`/movie/${id}/credits?language=en-US`, {
    next: { revalidate: 86400 },
  });
}

// revalidate: 604800 (1 week) — genre names essentially never change.
// Caching for a week means this fetch is effectively free for repeat visitors.
export async function fetchGenres(): Promise<GenreListResponse> {
  return tmdbFetch<GenreListResponse>(`/genre/movie/list?language=en-US`, {
    next: { revalidate: 604800 },
  });
}

// cache: 'no-store' — search results must be fresh because the user expects
// the response to match exactly what they typed. No caching here.
// Called only from /api/movies/search so the API key stays server-side.
export async function searchMovies(
  query: string,
  page = 1
): Promise<MovieListResponse> {
  const encoded = encodeURIComponent(query.trim());
  return tmdbFetch<MovieListResponse>(
    `/search/movie?query=${encoded}&page=${page}&language=en-US&include_adult=false`,
    { cache: 'no-store' }
  );
}
