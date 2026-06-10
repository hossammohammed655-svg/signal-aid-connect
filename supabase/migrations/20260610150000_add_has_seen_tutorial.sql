ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_seen_tutorial BOOLEAN NOT NULL DEFAULT false;
