import { NextRequest, NextResponse } from 'next/server';
import { searchMovies } from '@/lib/tmdb';

// Proxy route so the TMDB API key never reaches the browser.
// Client-side components (TanStack Query hooks) call this endpoint
// instead of TMDB directly — the key lives only on the server.
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query') ?? '';
  const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10);

  if (!query.trim()) {
    return NextResponse.json({
      results: [],
      total_pages: 0,
      total_results: 0,
      page: 1,
    });
  }

  try {
    const data = await searchMovies(query, page);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[/api/movies/search] failed:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}
