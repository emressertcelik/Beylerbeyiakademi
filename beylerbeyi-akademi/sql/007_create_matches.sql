-- =============================================
-- Migration: 007_create_matches
-- Beylerbeyi Akademi – Maç ve Oyuncu İstatistikleri
-- Bu dosya tekrar tekrar çalıştırılabilir (idempotent).
-- =============================================

-- ───────────────────────────────────────
-- 1) MAÇ TABLOSU
-- ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  season TEXT NOT NULL,
  age_group TEXT NOT NULL,
  opponent TEXT NOT NULL,
  home_away TEXT NOT NULL CHECK (home_away IN ('home', 'away')),
  score_home SMALLINT NOT NULL DEFAULT 0 CHECK (score_home >= 0),
  score_away SMALLINT NOT NULL DEFAULT 0 CHECK (score_away >= 0),
  result TEXT NOT NULL CHECK (result IN ('W', 'D', 'L')),
  venue TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ───────────────────────────────────────
-- 2) MAÇ OYUNCU İSTATİSTİKLERİ TABLOSU
-- ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.match_player_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  player_name TEXT NOT NULL,
  jersey_number SMALLINT NOT NULL,
  position TEXT NOT NULL,
  minutes_played SMALLINT NOT NULL DEFAULT 0 CHECK (minutes_played >= 0),
  goals SMALLINT NOT NULL DEFAULT 0 CHECK (goals >= 0),
  assists SMALLINT NOT NULL DEFAULT 0 CHECK (assists >= 0),
  yellow_cards SMALLINT NOT NULL DEFAULT 0 CHECK (yellow_cards >= 0),
  red_cards SMALLINT NOT NULL DEFAULT 0 CHECK (red_cards >= 0),
  goals_conceded SMALLINT NOT NULL DEFAULT 0 CHECK (goals_conceded >= 0),
  clean_sheet BOOLEAN NOT NULL DEFAULT false,
  rating SMALLINT CHECK (rating IS NULL OR (rating BETWEEN 1 AND 10)),
  UNIQUE(match_id, player_id)
);

-- ───────────────────────────────────────
-- 3) İNDEKSLER
-- ───────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_season ON public.matches(season);
CREATE INDEX IF NOT EXISTS idx_matches_age_group ON public.matches(age_group);
CREATE INDEX IF NOT EXISTS idx_match_player_stats_match ON public.match_player_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_match_player_stats_player ON public.match_player_stats(player_id);

-- ───────────────────────────────────────
-- 4) updated_at TRİGGER
-- ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_match_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_match_updated_at'
  ) THEN
    CREATE TRIGGER set_match_updated_at
      BEFORE UPDATE ON public.matches
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_match_updated_at();
  END IF;
END
$$;

-- ───────────────────────────────────────
-- 5) RLS POLİTİKALARI
-- ───────────────────────────────────────

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_player_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- matches SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'matches_select') THEN
    CREATE POLICY "matches_select" ON public.matches FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  -- matches WRITE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'matches_write') THEN
    CREATE POLICY "matches_write" ON public.matches FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;

  -- match_player_stats SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'match_player_stats_select') THEN
    CREATE POLICY "match_player_stats_select" ON public.match_player_stats FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  -- match_player_stats WRITE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'match_player_stats_write') THEN
    CREATE POLICY "match_player_stats_write" ON public.match_player_stats FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END
$$;
