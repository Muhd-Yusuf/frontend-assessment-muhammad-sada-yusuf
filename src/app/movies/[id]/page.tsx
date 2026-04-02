import { Suspense } from 'react';
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchMovieDetail, fetchMovieCredits } from '@/lib/tmdb';
import { buildImageUrl, formatYear, formatRating, formatRuntime, formatCurrency } from '@/lib/utils';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

interface PageProps {
  params: Promise<{ id: string }>;
}

// generateMetadata runs server-side and populates <head> for SEO and
// social sharing. Using the movie's own poster as og:image means link
// previews show the actual movie art when shared on Slack or Twitter.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const movieId = parseInt(id, 10);

  if (isNaN(movieId)) return { title: 'Movie Not Found' };

  try {
    const movie = await fetchMovieDetail(movieId);
    const ogImage = buildImageUrl(movie.backdrop_path ?? movie.poster_path, 'w780');

    return {
      title: `${movie.title} (${formatYear(movie.release_date)})`,
      description: movie.overview || `Details for ${movie.title}`,
      openGraph: {
        title: movie.title,
        description: movie.overview,
        images: ogImage ? [{ url: ogImage, width: 780, height: 439 }] : [],
      },
    };
  } catch {
    return { title: 'Movie Not Found' };
  }
}

// CastSection is a separate async Server Component intentionally.
// Wrapping it in <Suspense> lets Next.js stream it in after the
// above-fold content is already painted — Bonus B-2.
async function CastSection({ movieId }: { movieId: number }) {
  const credits = await fetchMovieCredits(movieId);
  const topCast = credits.cast.slice(0, 12);

  if (topCast.length === 0) return null;

  return (
    <section aria-labelledby="cast-heading">
      <h2 id="cast-heading" className="text-lg font-semibold text-white mb-4">
        Top Cast
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {topCast.map((member) => {
          const profileUrl = buildImageUrl(member.profile_path, 'w300');
          return (
            <div key={`${member.id}-${member.character}`} className="text-center">
              <div className="relative w-full aspect-square rounded-full overflow-hidden bg-slate-800 mb-2 mx-auto max-w-[80px]">
                {profileUrl ? (
                  <Image
                    src={profileUrl}
                    alt={member.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-white leading-tight">{member.name}</p>
              <p className="text-xs text-slate-500 leading-tight line-clamp-1">{member.character}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Skeleton for the cast section while it's streaming in
function CastSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="h-5 w-24 bg-slate-800 rounded mb-4 animate-pulse" />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-slate-800 animate-pulse" />
            <div className="h-2 w-14 bg-slate-800 rounded animate-pulse" />
            <div className="h-2 w-10 bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function MovieDetailPage({ params }: PageProps) {
  const { id } = await params;
  const movieId = parseInt(id, 10);

  if (isNaN(movieId)) notFound();

  let movie;
  try {
    movie = await fetchMovieDetail(movieId);
  } catch {
    notFound();
  }

  const posterUrl = buildImageUrl(movie.poster_path, 'w500');
  const backdropUrl = buildImageUrl(movie.backdrop_path, 'original');
  const year = formatYear(movie.release_date);
  const rating = formatRating(movie.vote_average);

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Backdrop hero image */}
      {backdropUrl && (
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
          <Image
            src={backdropUrl}
            alt={`${movie.title} backdrop`}
            fill
            sizes="100vw"
            className="object-cover"
            // Backdrop is always above the fold on the detail page, so we
            // prioritise it to improve LCP.
            priority
          />
          {/* Gradient overlay so text below remains readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Movies', href: '/movies' },
            { label: movie.title },
          ]}
        />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-full md:w-48 lg:w-56">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 shadow-2xl">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={`${movie.title} poster`}
                  fill
                  sizes="(max-width: 768px) 50vw, 224px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Movie info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-slate-400 italic mt-1 text-sm">{movie.tagline}</p>
              )}
            </div>

            {/* Key metadata — the two extra fields required by F-2 */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating}
                <span className="text-slate-500 font-normal">
                  ({movie.vote_count.toLocaleString()} votes)
                </span>
              </span>
              <span className="text-slate-400">{year}</span>
              <span className="text-slate-400">{formatRuntime(movie.runtime)}</span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full text-xs">
                {movie.status}
              </span>
            </div>

            {/* Genre tags */}
            {movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <a
                    key={genre.id}
                    href={`/movies?genre=${genre.id}`}
                    className="px-3 py-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    {genre.name}
                  </a>
                ))}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Overview
                </h2>
                <p className="text-slate-300 leading-relaxed text-sm">{movie.overview}</p>
              </div>
            )}

            {/* Budget / Revenue */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Budget</p>
                <p className="text-white font-medium text-sm">{formatCurrency(movie.budget)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Revenue</p>
                <p className="text-white font-medium text-sm">{formatCurrency(movie.revenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cast section — streamed in via Suspense (Bonus B-2).
            The above-fold content paints immediately; cast loads separately. */}
        <div className="mt-10 pt-8 border-t border-slate-800">
          <Suspense fallback={<CastSkeleton />}>
            <CastSection movieId={movieId} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
