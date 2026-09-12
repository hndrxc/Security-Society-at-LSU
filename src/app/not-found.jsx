import ErrorPanel from '@/components/layout/ErrorPanel';
import { ActionLink } from '@/components/ui/primitives';
export default function NotFound() {
  return <ErrorPanel eyebrow="404 / No signal" title="This page is unavailable." description="The page may have moved, or the competition may no longer be available."><ActionLink href="/events">Explore events</ActionLink><ActionLink href="/" variant="secondary">Back to home</ActionLink></ErrorPanel>;
}
