-- Repair environments where the event media migration was not applied.

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS image_path TEXT;

COMMENT ON COLUMN public.events.image_path IS
  'Storage path in the event-media bucket';
