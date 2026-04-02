# CineExplorer — Checkit Frontend Assessment

A production-quality movie discovery app built for the Checkit Frontend Engineer take-home assessment.

**Live URL:** https://frontend-assessment-muhammad-sada-y.vercel.app
**Stack:** Next.js 16 · TypeScript · Tailwind CSS · TanStack Query
**API:** [The Movie Database (TMDB)](https://developer.themoviedb.org/docs)

---

## Setup

```bash
git clone https://github.com/<your-username>/frontend-assessment-muhammad-sada-yusuf
cd frontend-assessment-muhammad-sada-yusuf
npm install
cp .env.example .env.local   # add your TMDB API key
npm run dev                  # http://localhost:3000
```

Get a free TMDB Read Access Token at: https://www.themoviedb.org/settings/api

---

## Architecture Decisions

### API Choice — TMDB
TMDB was chosen over DummyJSON or PokéAPI because movie poster imagery creates a richer visual experience, which directly impacts the UI quality. The API is well-documented, stable, free-tiered, and supports pagination, search, genre filtering, and detailed metadata — covering all required features without workarounds.

### Pagination over Infinite Scroll
I chose pagination because the assessment requires URL-driven state. With pagination, `/movies?page=3&genre=28` is a fully shareable, bookmarkable URL that survives hard refreshes and the browser back button. Infinite scroll would require storing scroll position and page offset in the URL, adding complexity without a meaningful UX benefit for a content-browsing interface.

### Deployment — Vercel
Vercel integrates directly with GitHub (zero-config CI/CD), has native Next.js support without an adapter layer, and lets me focus assessment time on code quality rather than infrastructure. With Cloudflare Workers I would need the OpenNext adapter, which adds a non-trivial setup step that could introduce deployment edge cases unrelated to the frontend work being assessed.

### Server Components for Listing + TanStack Query for Search
The listing and detail pages are Server Components that fetch at render time using Next.js `fetch` caching. When the user searches, a `SearchResults` client component uses TanStack Query to call an internal proxy route (`/api/movies/search`). This means:
- Browseable content is SSR'd and indexable
- Search results are always fresh
- The TMDB API key stays server-side — the browser never calls TMDB directly

### Folder Structure
- **`lib/tmdb.ts`** — all TMDB fetch calls in one file; components never call `fetch()` directly
- **`types/tmdb.ts`** — all shared types centralised; no inline type definitions scattered across files
- **`hooks/`** — business logic extracted from components so it is independently testable
- **`components/ui/`** — presentational components co-located with their logic
- **`components/providers/`** — context providers isolated from UI

---

## Performance Optimizations

### 1. `next/image` with explicit sizing
Every `<Image>` has `fill` + `sizes` or fixed dimensions. The `sizes` attribute tells the browser which resolution to fetch at each breakpoint, avoiding a full 500px image download on mobile. The first 4 listing cards and the detail backdrop have `priority={true}`, which adds a `<link rel="preload">` and directly improves LCP.

### 2. `next/font` — self-hosted Geist
The font is downloaded and self-hosted at build time, eliminating a render-blocking request to Google Fonts and the FOUT (flash of unstyled text) that causes CLS. `display: 'swap'` keeps text visible during font loading.

### 3. Tiered fetch caching
Each API call has a cache policy matched to how often that data actually changes:

| Data | Policy | Reason |
|------|---------|--------|
| Popular movies | `revalidate: 300` | Changes slowly; 5 min is fresh enough |
| Movie detail | `revalidate: 86400` | Metadata rarely changes post-release |
| Genre list | `revalidate: 604800` | Genres essentially never change |
| Search | `cache: 'no-store'` | Must always match the exact query |

### 4. Static asset cache headers
`/_next/static/*` is served with `Cache-Control: public, max-age=31536000, immutable`. Next.js content-hashes filenames at build time so it is safe to cache them for a year — the hash changes when content changes, busting the cache automatically.

### 5. Suspense streaming for cast section (Bonus B-2)
The cast section on the detail page is a separate async Server Component wrapped in `<Suspense>`. The above-fold content (poster, title, overview) streams to the browser first while cast data fetches in parallel, keeping the page interactive sooner.

---

## Bonus Tasks

### B-2 — React 18 Streaming with Suspense ✅
`CastSection` on `/movies/[id]` is an async Server Component with its own `fetchMovieCredits` call, wrapped in `<Suspense fallback={<CastSkeleton />}>`. The above-fold content renders immediately; the cast section streams in separately when its data resolves.

### B-3 — Accessibility ✅
- All interactive elements have visible `focus-visible:ring-2` focus rings
- Images have descriptive `alt` text; decorative icons use `aria-hidden`
- Empty states use `role="status"` and `aria-live="polite"` so screen readers announce result changes
- Breadcrumb uses `<nav aria-label="Breadcrumb">` and `aria-current="page"` on the active item
- Pagination uses `<nav aria-label="Pagination">` and `aria-current="page"` on the active button
- Search input has `role="searchbox"` and `aria-label`

---

## Trade-offs and Known Limitations

- **No `generateStaticParams` on detail pages** — movies are fetched on-demand with ISR rather than statically pre-generating all ~900k movie pages at build time. Pre-generation would make every build take hours; ISR with 24h revalidation is the correct trade-off for a dynamic dataset.
- **Genre + search don't combine** — TMDB's search endpoint does not support `with_genres`, so genre filtering only works in browse mode. With more time I would use the discover endpoint with a full-text workaround.
- **No pagination prefetch** — clicking Next shows a brief skeleton. Prefetching the next page on hover via `queryClient.prefetchQuery` would eliminate this; left out to keep scope focused on core quality.

---

## Testing

```bash
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # generate coverage report
```

- `useDebounce` — 5 tests: initial value, no-update before delay, update after delay, debounce of rapid sequential inputs, generic types
- `MovieCard` — 8 tests: title, year, rating, vote count, link href, poster image, no-poster fallback, missing release date

---

## What I Would Do With Another 2 Hours

1. Add `generateStaticParams` for the top 200 popular movies so they serve as static HTML with zero server latency
2. Implement hover-based prefetching on movie cards (`router.prefetch`) for instant-feeling detail page loads
3. Run a full axe-core programmatic audit and fix any remaining WCAG AA violations to push accessibility score to 100
