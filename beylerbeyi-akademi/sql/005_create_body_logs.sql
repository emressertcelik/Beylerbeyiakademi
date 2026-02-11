-- =============================================
-- Migration: 005_create_body_measurement_logs
-- Beylerbeyi Akademi - Boy/Kilo Değişim Logu
-- Oyuncuların fiziksel gelişimini takip etmek için
-- =============================================

-- 1) Ölçüm tipi enum
CREATE TYPE measurement_type AS ENUM ('height', 'weight');

-- 2) Fiziksel ölçüm logu tablosu
CREATE TABLE public.player_body_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  measurement measurement_type NOT NULL,           -- 'height' veya 'weight'
  old_value SMALLINT NOT NULL,
  new_value SMALLINT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3) İndeksler
CREATE INDEX idx_body_logs_player ON public.player_body_logs(player_id);
CREATE INDEX idx_body_logs_changed_at ON public.player_body_logs(changed_at DESC);

-- 4) Boy/Kilo değişim trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.log_body_measurement_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Boy değişimi
  IF OLD.height IS DISTINCT FROM NEW.height AND OLD.height IS NOT NULL THEN
    INSERT INTO public.player_body_logs (player_id, measurement, old_value, new_value, changed_by)
    VALUES (NEW.id, 'height', OLD.height, NEW.height, auth.uid());
  END IF;

  -- Kilo değişimi
  IF OLD.weight IS DISTINCT FROM NEW.weight AND OLD.weight IS NOT NULL THEN
    INSERT INTO public.player_body_logs (player_id, measurement, old_value, new_value, changed_by)
    VALUES (NEW.id, 'weight', OLD.weight, NEW.weight, auth.uid());
  END IF;

  RETURN NEW;
END;
$$;

-- 5) Trigger
CREATE TRIGGER log_body_changes
  AFTER UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.log_body_measurement_changes();

-- 6) RLS
ALTER TABLE public.player_body_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view body logs"
  ON public.player_body_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can insert body logs"
  ON public.player_body_logs FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) IN ('yonetici', 'antrenor'));
