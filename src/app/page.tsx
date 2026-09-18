import { redirect } from 'next/navigation';

/**
 * There is no marketing page in the MVP. `/dashboard` is behind the auth guard, which sends
 * signed-out visitors to `/login` — so this single redirect covers both cases.
 */
export default function RootPage() {
  redirect('/dashboard');
}
