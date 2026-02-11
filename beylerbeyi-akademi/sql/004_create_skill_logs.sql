-- =============================================
-- Migration: 004_create_skill_logs
-- Beylerbeyi Akademi - Beceri Değişim Logu
-- Oyuncuların taktik ve atletik gelişimini takip etmek için
-- =============================================

-- 1) Beceri kategorisi enum
CREATE TYPE skill_category AS ENUM ('tactical', 'athletic');

-- 2) Beceri değişim logu tablosu
CREATE TABLE public.player_skill_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  category skill_category NOT NULL,                -- 'tactical' veya 'athletic'
  skill_name TEXT NOT NULL,                         -- 'positioning', 'speed' vs.
  old_value SMALLINT NOT NULL,
  new_value SMALLINT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),        -- Değişikliği yapan kullanıcı
  changed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3) İndeksler
CREATE INDEX idx_skill_logs_player ON public.player_skill_logs(player_id);
CREATE INDEX idx_skill_logs_player_category ON public.player_skill_logs(player_id, category);
CREATE INDEX idx_skill_logs_changed_at ON public.player_skill_logs(changed_at DESC);

-- 4) Taktik beceri değişim trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.log_tactical_skill_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- İlk güncelleme kontrolü: tüm eski değerler default (5) ise loglama
  -- Bu, oyuncu ilk oluşturulduğunda default→gerçek değer geçişini engeller
  IF OLD.positioning = 5 AND OLD.passing = 5 AND OLD.crossing = 5 AND OLD.shooting = 5
     AND OLD.dribbling = 5 AND OLD.heading = 5 AND OLD.tackling = 5
     AND OLD.marking = 5 AND OLD.game_reading = 5 THEN
    RETURN NEW;
  END IF;

  -- Her bir beceri alanını kontrol et, değişenleri logla
  IF OLD.positioning IS DISTINCT FROM NEW.positioning THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'tactical', 'positioning', OLD.positioning, NEW.positioning, auth.uid());
  END IF;

  IF OLD.passing IS DISTINCT FROM NEW.passing THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'tactical', 'passing', OLD.passing, NEW.passing, auth.uid());
  END IF;

  IF OLD.crossing IS DISTINCT FROM NEW.crossing THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'tactical', 'crossing', OLD.crossing, NEW.crossing, auth.uid());
  END IF;

  IF OLD.shooting IS DISTINCT FROM NEW.shooting THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'tactical', 'shooting', OLD.shooting, NEW.shooting, auth.uid());
  END IF;

  IF OLD.dribbling IS DISTINCT FROM NEW.dribbling THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'tactical', 'dribbling', OLD.dribbling, NEW.dribbling, auth.uid());
  END IF;

  IF OLD.heading IS DISTINCT FROM NEW.heading THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'tactical', 'heading', OLD.heading, NEW.heading, auth.uid());
  END IF;

  IF OLD.tackling IS DISTINCT FROM NEW.tackling THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'tactical', 'tackling', OLD.tackling, NEW.tackling, auth.uid());
  END IF;

  IF OLD.marking IS DISTINCT FROM NEW.marking THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'tactical', 'marking', OLD.marking, NEW.marking, auth.uid());
  END IF;

  IF OLD.game_reading IS DISTINCT FROM NEW.game_reading THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'tactical', 'game_reading', OLD.game_reading, NEW.game_reading, auth.uid());
  END IF;

  RETURN NEW;
END;
$$;

-- 5) Atletik beceri değişim trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.log_athletic_skill_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- İlk güncelleme kontrolü: tüm eski değerler default (5) ise loglama
  IF OLD.speed = 5 AND OLD.strength = 5 AND OLD.stamina = 5 AND OLD.agility = 5
     AND OLD.jumping = 5 AND OLD.balance = 5 AND OLD.flexibility = 5 THEN
    RETURN NEW;
  END IF;

  IF OLD.speed IS DISTINCT FROM NEW.speed THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'athletic', 'speed', OLD.speed, NEW.speed, auth.uid());
  END IF;

  IF OLD.strength IS DISTINCT FROM NEW.strength THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'athletic', 'strength', OLD.strength, NEW.strength, auth.uid());
  END IF;

  IF OLD.stamina IS DISTINCT FROM NEW.stamina THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'athletic', 'stamina', OLD.stamina, NEW.stamina, auth.uid());
  END IF;

  IF OLD.agility IS DISTINCT FROM NEW.agility THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'athletic', 'agility', OLD.agility, NEW.agility, auth.uid());
  END IF;

  IF OLD.jumping IS DISTINCT FROM NEW.jumping THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'athletic', 'jumping', OLD.jumping, NEW.jumping, auth.uid());
  END IF;

  IF OLD.balance IS DISTINCT FROM NEW.balance THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'athletic', 'balance', OLD.balance, NEW.balance, auth.uid());
  END IF;

  IF OLD.flexibility IS DISTINCT FROM NEW.flexibility THEN
    INSERT INTO public.player_skill_logs (player_id, category, skill_name, old_value, new_value, changed_by)
    VALUES (NEW.player_id, 'athletic', 'flexibility', OLD.flexibility, NEW.flexibility, auth.uid());
  END IF;

  RETURN NEW;
END;
$$;

-- 6) Trigger'ları oluştur
CREATE TRIGGER log_tactical_changes
  AFTER UPDATE ON public.player_tactical_skills
  FOR EACH ROW EXECUTE FUNCTION public.log_tactical_skill_changes();

CREATE TRIGGER log_athletic_changes
  AFTER UPDATE ON public.player_athletic_skills
  FOR EACH ROW EXECUTE FUNCTION public.log_athletic_skill_changes();

-- 7) RLS
ALTER TABLE public.player_skill_logs ENABLE ROW LEVEL SECURITY;

-- Giriş yapmış kullanıcılar okuyabilir
CREATE POLICY "Authenticated users can view skill logs"
  ON public.player_skill_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Sadece trigger'lar yazar (SECURITY DEFINER), doğrudan INSERT gerekmiyor
-- Ama gerekirse staff INSERT yapabilsin
CREATE POLICY "Staff can insert skill logs"
  ON public.player_skill_logs FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) IN ('yonetici', 'antrenor'));
