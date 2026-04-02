// Utility functions shared across the app. These are pure functions with
// no side effects, which makes them easy to unit test and reason about.

export function buildImageUrl(
  path: string | null,
  size: 'w300' | 'w500' | 'w780' | 'original' = 'w500'
): string | null {
  if (!path) return null;
  // TMDB serves all images from this CDN. Choosing w500 for cards balances
  // quality and payload size. The caller can override for larger hero images.
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function formatYear(dateString: string | null): string {
  if (!dateString) return 'Unknown';
  const year = new Date(dateString).getFullYear();
  return isNaN(year) ? 'Unknown' : String(year);
}

export function formatRating(rating: number): string {
  // toFixed(1) to keep it consistent — "7.0" looks better than "7"
  return rating.toFixed(1);
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

// Lightweight class merger — avoids pulling in clsx just for string joining.
// If conditional class logic gets complex we can upgrade to clsx + tailwind-merge.
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
