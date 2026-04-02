'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

// URL-driven pagination — clicking a page number pushes a new URL so the
// browser back button works correctly and the page is shareable at any point.
export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page));
      router.push(`${pathname}?${params.toString()}`);
      // Scroll back to top so the user sees the new content immediately
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router, pathname, searchParams]
  );

  if (totalPages <= 1) return null;

  // Build the visible page range: always show first, last, current ±2
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | 'ellipsis')[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (range[0] && range[0] > 2) rangeWithDots.push(1, 'ellipsis');
    else rangeWithDots.push(1);

    rangeWithDots.push(...range);

    const last = range[range.length - 1];
    if (last && last < totalPages - 1) rangeWithDots.push('ellipsis', totalPages);
    else rangeWithDots.push(totalPages);

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-10"
      aria-label="Pagination"
    >
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        ← Prev
      </button>

      {pages.map((page, idx) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-slate-600">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}
