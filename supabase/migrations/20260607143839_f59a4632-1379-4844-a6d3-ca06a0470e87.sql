CREATE TABLE public.symptom_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT[] NOT NULL,
  risk_level TEXT NOT NULL,
  explanation_ar TEXT NOT NULL,
  explanation_en TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.symptom_sessions TO authenticated;
GRANT ALL ON public.symptom_sessions TO service_role;

ALTER TABLE public.symptom_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own sessions" ON public.symptom_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_symptom_sessions_user_created ON public.symptom_sessions(user_id, created_at DESC);