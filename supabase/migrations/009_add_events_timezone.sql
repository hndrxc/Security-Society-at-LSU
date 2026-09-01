-- Keep event input and display times tied to the timezone selected by admins.
-- Existing rows are backfilled with the club's default timezone.

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/Chicago';

COMMENT ON COLUMN public.events.timezone IS
  'IANA timezone used to enter and display the event schedule';
