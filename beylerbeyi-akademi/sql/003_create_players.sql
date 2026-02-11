-- =============================================
-- Migration: 003_create_players
-- Beylerbeyi Akademi - Oyuncu Tabloları
-- =============================================

-- 1) Enum tipleri
CREATE TYPE player_position AS ENUM ('Kaleci', 'Defans', 'Orta Saha', 'Forvet');
CREATE TYPE player_foot AS ENUM ('Sağ', 'Sol', 'Her İkisi');
CREATE TYPE player_age_group AS ENUM ('U14', 'U15', 'U16', 'U17', 'U19');

-- 2) Oyuncular tablosu
CREATE TABLE public.players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  age_group player_age_group NOT NULL,
  position player_position NOT NULL,
  foot player_foot NOT NULL DEFAULT 'Sağ',
  jersey_number SMALLINT NOT NULL CHECK (jersey_number BETWEEN 1 AND 99),
  height SMALLINT CHECK (height BETWEEN 100 AND 220),        -- cm
  weight SMALLINT CHECK (weight BETWEEN 30 AND 120),         -- kg
  seasons TEXT[] NOT NULL DEFAULT ARRAY['2025-2026'],         -- Sezon listesi
  photo TEXT,                                                  -- URL
  phone TEXT,
  parent_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3) Önceki takımlar tablosu (1-N ilişki)
CREATE TABLE public.player_previous_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT NOT NULL,
  years TEXT NOT NULL,                                         -- örn: "2023-2025"
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4) Taktik beceriler tablosu (1-1 ilişki)
CREATE TABLE public.player_tactical_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL UNIQUE,
  positioning SMALLINT DEFAULT 5 CHECK (positioning BETWEEN 1 AND 10),      -- Pozisyon alma
  passing SMALLINT DEFAULT 5 CHECK (passing BETWEEN 1 AND 10),              -- Pas
  crossing SMALLINT DEFAULT 5 CHECK (crossing BETWEEN 1 AND 10),            -- Orta
  shooting SMALLINT DEFAULT 5 CHECK (shooting BETWEEN 1 AND 10),            -- Şut
  dribbling SMALLINT DEFAULT 5 CHECK (dribbling BETWEEN 1 AND 10),          -- Dribling
  heading SMALLINT DEFAULT 5 CHECK (heading BETWEEN 1 AND 10),              -- Kafa vuruşu
  tackling SMALLINT DEFAULT 5 CHECK (tackling BETWEEN 1 AND 10),            -- Top kesme
  marking SMALLINT DEFAULT 5 CHECK (marking BETWEEN 1 AND 10),              -- Adam markajı
  game_reading SMALLINT DEFAULT 5 CHECK (game_reading BETWEEN 1 AND 10),    -- Oyun okuma
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5) Atletik beceriler tablosu (1-1 ilişki)
CREATE TABLE public.player_athletic_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL UNIQUE,
  speed SMALLINT DEFAULT 5 CHECK (speed BETWEEN 1 AND 10),                  -- Hız
  strength SMALLINT DEFAULT 5 CHECK (strength BETWEEN 1 AND 10),            -- Güç
  stamina SMALLINT DEFAULT 5 CHECK (stamina BETWEEN 1 AND 10),              -- Dayanıklılık
  agility SMALLINT DEFAULT 5 CHECK (agility BETWEEN 1 AND 10),              -- Çeviklik
  jumping SMALLINT DEFAULT 5 CHECK (jumping BETWEEN 1 AND 10),              -- Sıçrama
  balance SMALLINT DEFAULT 5 CHECK (balance BETWEEN 1 AND 10),              -- Denge
  flexibility SMALLINT DEFAULT 5 CHECK (flexibility BETWEEN 1 AND 10),      -- Esneklik
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6) İndeksler
CREATE INDEX idx_players_age_group ON public.players(age_group);
CREATE INDEX idx_players_position ON public.players(position);
CREATE INDEX idx_players_seasons ON public.players USING GIN(seasons);
CREATE INDEX idx_players_jersey ON public.players(jersey_number);
CREATE INDEX idx_player_prev_teams_player ON public.player_previous_teams(player_id);
CREATE INDEX idx_player_tactical_player ON public.player_tactical_skills(player_id);
CREATE INDEX idx_player_athletic_player ON public.player_athletic_skills(player_id);

-- 7) Updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger'lar
CREATE TRIGGER set_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_tactical_updated_at
  BEFORE UPDATE ON public.player_tactical_skills
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_athletic_updated_at
  BEFORE UPDATE ON public.player_athletic_skills
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8) Oyuncu eklendiğinde otomatik olarak tactical ve athletic satırı oluştur
CREATE OR REPLACE FUNCTION public.create_player_skills()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.player_tactical_skills (player_id) VALUES (NEW.id);
  INSERT INTO public.player_athletic_skills (player_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_skills_on_player_insert
  AFTER INSERT ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.create_player_skills();

-- 9) RLS (Row Level Security)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_previous_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_tactical_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_athletic_skills ENABLE ROW LEVEL SECURITY;

-- Giriş yapmış kullanıcılar okuyabilir
CREATE POLICY "Authenticated users can view players"
  ON public.players FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view previous teams"
  ON public.player_previous_teams FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view tactical skills"
  ON public.player_tactical_skills FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view athletic skills"
  ON public.player_athletic_skills FOR SELECT
  USING (auth.role() = 'authenticated');

-- Yöneticiler ve antrenörler yazabilir (get_user_role fonksiyonu 002'de oluşturuldu)
CREATE POLICY "Staff can insert players"
  ON public.players FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) IN ('yonetici', 'antrenor'));

CREATE POLICY "Staff can update players"
  ON public.players FOR UPDATE
  USING (public.get_user_role(auth.uid()) IN ('yonetici', 'antrenor'));

CREATE POLICY "Staff can delete players"
  ON public.players FOR DELETE
  USING (public.get_user_role(auth.uid()) IN ('yonetici', 'antrenor'));

-- Previous teams
CREATE POLICY "Staff can insert previous teams"
  ON public.player_previous_teams FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) IN ('yonetici', 'antrenor'));

CREATE POLICY "Staff can update previous teams"
  ON public.player_previous_teams FOR UPDATE
  USING (public.get_user_role(auth.uid()) IN ('yonetici', 'antrenor'));

CREATE POLICY "Staff can delete previous teams"
  ON public.player_previous_teams FOR DELETE
  USING (public.get_user_role(auth.uid()) IN ('yonetici', 'antrenor'));

-- Tactical skills
CREATE POLICY "Staff can update tactical skills"
  ON public.player_tactical_skills FOR UPDATE
  USING (public.get_user_role(auth.uid()) IN ('yonetici', 'antrenor'));

-- Athletic skills
CREATE POLICY "Staff can update athletic skills"
  ON public.player_athletic_skills FOR UPDATE
  USING (public.get_user_role(auth.uid()) IN ('yonetici', 'antrenor'));
