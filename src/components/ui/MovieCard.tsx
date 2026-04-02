import Image from 'next/image';
import Link from 'next/link';
import { buildImageUrl, formatYear, formatRating } from '@/lib/utils';
import type { Movie } from '@/types/tmdb';

interface MovieCardProps {
  movie: Movie;
  // priority=true on the first few cards tells next/image to preload them,
  // which directly improves LCP on the listing page.
  priority?: boolean;
}

export function MovieCard({ movie, priority = false }: MovieCardProps) {
  const posterUrl = buildImageUrl(movie.poster_path, 'w500');
  const year = formatYear(movie.release_date);
  const rating = formatRating(movie.vote_average);

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group block rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      aria-label={`View details for ${movie.title}`}
    >
      {/* Poster area — fixed aspect ratio prevents layout shift (CLS) */}
      <div className="relative aspect-[2/3] bg-slate-800">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`${movie.title} poster`}
            fill
            // Responsive sizes tell the browser which image to download
            // at each breakpoint — avoids fetching a 500px image on mobile.
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-opacity duration-300 group-hover:opacity-90"
            priority={priority}
          />
        ) : (
          // Graceful fallback when TMDB has no poster on record
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
            <span className="text-xs">No poster</span>
          </div>
        )}

        {/* Rating badge — overlaid bottom-left to avoid covering the subject's face */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3 text-amber-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-bold text-amber-400">{rating}</span>
        </div>
      </div>

      {/* Card metadata */}
      <div className="p-3 space-y-1">
        <h2 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors duration-150">
          {movie.title}
        </h2>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{year}</span>
          <span>{movie.vote_count.toLocaleString()} votes</span>
        </div>
      </div>
    </Link>
  );
}
