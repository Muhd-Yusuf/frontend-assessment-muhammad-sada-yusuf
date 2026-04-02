interface EmptyStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

// Dedicated empty state rather than just hiding the grid. A visible message
// with a clear action prevents users from thinking the page is broken.
export function EmptyState({
  title = 'Nothing found',
  message,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="w-16 h-16 mb-4 rounded-full bg-slate-800 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs">{message}</p>
      {action && (
        <a
          href={action.href}
          className="mt-6 px-4 py-2 bg-amber-500 text-slate-950 text-sm font-semibold rounded-lg hover:bg-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
