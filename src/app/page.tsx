import { redirect } from 'next/navigation';

// Root "/" redirects to "/movies" so the app always lands on the content.
// Using a server-side redirect means there's no client navigation cost
// and the browser never renders a blank intermediary page.
export default function RootPage() {
  redirect('/movies');
}
