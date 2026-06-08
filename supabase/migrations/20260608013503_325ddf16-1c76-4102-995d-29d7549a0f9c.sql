
-- 1) videos table
CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text,
  category text NOT NULL DEFAULT 'general',
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view videos"
  ON public.videos FOR SELECT TO authenticated USING (true);

-- 2) emergency_contacts table (max 5 per user enforced by trigger)
CREATE TABLE public.emergency_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;
GRANT ALL ON public.emergency_contacts TO service_role;

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own emergency contacts"
  ON public.emergency_contacts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_emergency_contacts_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM public.emergency_contacts WHERE user_id = NEW.user_id) >= 5 THEN
    RAISE EXCEPTION 'You can save up to 5 emergency contacts only.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER emergency_contacts_limit
  BEFORE INSERT ON public.emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_emergency_contacts_limit();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER emergency_contacts_set_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Seed sample videos
INSERT INTO public.videos (title_ar, title_en, description_ar, description_en, video_url, thumbnail_url, category, is_verified) VALUES
('كيفية استخدام حقنة الإبينفرين', 'How to use an EpiPen',
 'شرح خطوة بخطوة لاستخدام حقنة الإبينفرين في حالات الحساسية الحادة.',
 'Step-by-step guide for using an EpiPen during severe allergic reactions.',
 'https://www.youtube.com/watch?v=2dY-3SAJ6sQ',
 'https://img.youtube.com/vi/2dY-3SAJ6sQ/hqdefault.jpg',
 'emergency', true),
('الإنعاش القلبي الرئوي للبالغين', 'CPR for adults',
 'تعلم خطوات الإنعاش القلبي الرئوي بشكل صحيح للبالغين.',
 'Learn the correct steps to perform CPR on adults.',
 'https://www.youtube.com/watch?v=BQNNOh8c8ks',
 'https://img.youtube.com/vi/BQNNOh8c8ks/hqdefault.jpg',
 'emergency', true),
('قراءة ملصقات الوصفات الطبية', 'Reading prescription labels',
 'كيف تفهم ملصق دوائك بسهولة وأمان.',
 'How to safely understand your prescription label.',
 'https://www.youtube.com/watch?v=qy_iN-Vjf_w',
 'https://img.youtube.com/vi/qy_iN-Vjf_w/hqdefault.jpg',
 'pharmacy', true),
('إشارات الأعراض الشائعة', 'Signing common symptoms',
 'تعلم لغة الإشارة للتعبير عن الأعراض الشائعة في الصيدلية.',
 'Learn sign language to communicate common symptoms at the pharmacy.',
 'https://www.youtube.com/watch?v=v1desDduz5M',
 'https://img.youtube.com/vi/v1desDduz5M/hqdefault.jpg',
 'sign_language', true),
('الرعاية اليومية لمرضى السكري', 'Daily care for diabetes',
 'نصائح يومية للسيطرة على مرض السكري بأمان.',
 'Daily tips for safely managing diabetes.',
 'https://www.youtube.com/watch?v=wZAjVQWbMlE',
 'https://img.youtube.com/vi/wZAjVQWbMlE/hqdefault.jpg',
 'general', true);
