-- ═══════════════════════════════════════════════════════════════
-- 日子有数 Days Count — Supabase Database Setup
-- Run this in your Supabase project's SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Create the events table
CREATE TABLE IF NOT EXISTS public.events (
  id           TEXT          PRIMARY KEY,
  user_id      UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT          NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  date         DATE          NOT NULL,
  emoji        TEXT          DEFAULT '📅' CONSTRAINT events_emoji_safe CHECK (char_length(emoji) <= 8 AND emoji !~ '[<>&"]'),
  color        TEXT          DEFAULT 'orange' CHECK (color IN ('orange','red','green','blue','purple','gold','rose')),
  note         TEXT          DEFAULT '' CHECK (char_length(note) <= 200),
  is_annual    BOOLEAN       DEFAULT FALSE,
  created_at   TIMESTAMPTZ   DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ   DEFAULT NOW() NOT NULL
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_user_id  ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date     ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_user_date ON public.events(user_id, date);

-- Existing installs: add the emoji safety constraint if this script is re-run
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'events_emoji_safe'
      AND conrelid = 'public.events'::regclass
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_emoji_safe
      CHECK (char_length(emoji) <= 8 AND emoji !~ '[<>&"]');
  END IF;
END;
$$;

-- 3. Enable Row Level Security (critical for multi-tenant security)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: each user can only access their own events
CREATE POLICY "select_own_events"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own_events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_events"
  ON public.events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_events"
  ON public.events FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Enforce 10,000 records per user limit via database function
CREATE OR REPLACE FUNCTION public.check_event_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM public.events WHERE user_id = NEW.user_id
  ) >= 10000 THEN
    RAISE EXCEPTION 'Event limit of 10,000 reached for this user.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

CREATE TRIGGER enforce_event_limit
  BEFORE INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.check_event_limit();

-- 6. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 7. Optional: Grant access to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;

-- 8. Auth hook: reject non-QQ email registration server-side.
-- Enable this function in Supabase Dashboard > Authentication > Hooks >
-- Before User Created. Also enable email confirmation in Authentication settings.
CREATE OR REPLACE FUNCTION public.restrict_signup_to_qq_email(event jsonb)
RETURNS jsonb AS $$
DECLARE
  email text;
BEGIN
  email := lower(coalesce(event->'user'->>'email', ''));

  IF email !~ '^[^@\s]+@qq\.com$' THEN
    RETURN jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Only QQ email registration is allowed.'
      )
    );
  END IF;

  RETURN event;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
REVOKE ALL ON FUNCTION public.restrict_signup_to_qq_email(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.restrict_signup_to_qq_email(jsonb) TO supabase_auth_admin;

-- ═══════════════════════════════════════════════════════════════
-- Setup complete! 
-- Next steps:
-- 1. Copy your Project URL and publishable key from Settings > API
-- 2. Configure SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and TURNSTILE_SITE_KEY in Cloudflare Pages env / wrangler.toml
-- 3. Enable Email auth and email confirmation in Authentication > Providers / Settings
-- 4. Configure Turnstile CAPTCHA in Authentication > Protection
-- 5. Enable the Before User Created hook: public.restrict_signup_to_qq_email
-- ═══════════════════════════════════════════════════════════════
