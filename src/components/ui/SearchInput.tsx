'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputProps {
  defaultValue?: string;
  className?: string;
}

export function SearchInput({ defaultValue = '', className = '' }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(defaultValue);
  // 400ms debounce — slightly above the 300ms minimum to avoid
  // hammering the API while the user is still mid-word.
  const debouncedValue = useDebounce(value, 400);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedValue.trim()) {
      params.set('query', debouncedValue.trim());
      // Reset to page 1 when the query changes — staying on page 5 of a
      // previous search while switching queries would show wrong results.
      params.set('page', '1');
    } else {
      params.delete('query');
      params.delete('page');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedValue, pathname, router, searchParams]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="search"
        role="searchbox"
        aria-label="Search movies"
        placeholder="Search movies…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
