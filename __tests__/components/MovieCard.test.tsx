import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovieCard } from '@/components/ui/MovieCard';
import type { Movie } from '@/types/tmdb';

// next/image and next/link don't work in jsdom as-is, so we mock
// only the parts we care about to keep tests focused on component behaviour.
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const baseMovie: Movie = {
  id: 1,
  title: 'Inception',
  overview: 'A mind-bending thriller.',
  poster_path: '/inception.jpg',
  backdrop_path: '/inception_backdrop.jpg',
  vote_average: 8.4,
  vote_count: 32000,
  release_date: '2010-07-16',
  genre_ids: [28, 878],
  popularity: 100,
};

describe('MovieCard', () => {
  it('renders the movie title', () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  it('renders the release year', () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText('2010')).toBeInTheDocument();
  });

  it('renders the vote average', () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText('8.4')).toBeInTheDocument();
  });

  it('renders the vote count', () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText('32,000 votes')).toBeInTheDocument();
  });

  it('links to the correct detail page', () => {
    render(<MovieCard movie={baseMovie} />);
    const link = screen.getByRole('link', { name: /view details for inception/i });
    expect(link).toHaveAttribute('href', '/movies/1');
  });

  it('renders the poster image with correct alt text', () => {
    render(<MovieCard movie={baseMovie} />);
    const img = screen.getByAltText('Inception poster');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('inception.jpg'));
  });

  it('renders a fallback when poster_path is null', () => {
    const movieWithoutPoster: Movie = { ...baseMovie, poster_path: null };
    render(<MovieCard movie={movieWithoutPoster} />);
    expect(screen.getByText('No poster')).toBeInTheDocument();
    expect(screen.queryByAltText('Inception poster')).not.toBeInTheDocument();
  });

  it('renders "Unknown" year when release_date is empty', () => {
    const movieWithoutDate: Movie = { ...baseMovie, release_date: '' };
    render(<MovieCard movie={movieWithoutDate} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
