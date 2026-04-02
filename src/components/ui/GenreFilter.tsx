'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Genre } from '@/types/tmdb';

interface GenreFilterProps {
  genres: Genre[];
  defaultGenre?: string;
}

// Genre filter pushes to the URL so the selection is captured in history
// and survives a page refresh — same principle as SearchInput.
export function GenreFilter({ genres, defaultGenre = '' }: GenreFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (e.target.value) {
      params.set('genre', e.target.value);
    } else {
      params.delete('genre');
    }
    // Reset to page 1 when filter changes
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative">
      <select
        defaultValue={defaultGenre}
        onChange={handleChange}
        aria-label="Filter by genre"
        className="appearance-none bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 pr-9 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors cursor-pointer min-w-[160px]"
      >
        <option value="">All Genres</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow since we stripped browser default with appearance-none */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
