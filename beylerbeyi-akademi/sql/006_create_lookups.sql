-- =============================================
-- Migration: 006_create_lookups
-- Beylerbeyi Akademi – Dinamik Lookup Tabloları
-- Yaş grubu, pozisyon, ayak ve sezon bilgileri
-- artık ENUM yerine lookup tablolarından yönetilir.
-- Bu dosya tekrar tekrar çalıştırılabilir (idempotent).
-- =============================================

-- ───────────────────────────────────────
-- 1) LOOKUP TABLOLARI
-- ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lookup_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  sort_order SMALLINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lookup_feet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  sort_order SMALLINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lookup_age_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  sort_order SMALLINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lookup_seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  sort_order SMALLINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ───────────────────────────────────────
-- 2) MEVCUT ENUM DEĞERLERİNİ MİGRE ET
-- ───────────────────────────────────────

INSERT INTO public.lookup_positions (value, sort_order) VALUES
  ('Kaleci',    1),
  ('Defans',    2),
  ('Orta Saha', 3),
  ('Forvet',    4)
ON CONFLICT (value) DO NOTHING;

INSERT INTO public.lookup_feet (value, sort_order) VALUES
  ('Sağ',       1),
  ('Sol',       2),
  ('Her İkisi', 3)
ON CONFLICT (value) DO NOTHING;

INSERT INTO public.lookup_age_groups (value, sort_order) VALUES
  ('U14', 1),
  ('U15', 2),
  ('U16', 3),
  ('U17', 4),
  ('U19', 5)
ON CONFLICT (value) DO NOTHING;

INSERT INTO public.lookup_seasons (value, sort_order) VALUES
  ('2025-2026', 1)
ON CONFLICT (value) DO NOTHING;

-- ───────────────────────────────────────
-- 3) OYUNCU KOLONLARINI ENUM → TEXT
--    Önce DEFAULT değerleri kaldır,
--    sonra tipi değiştir, ardından
--    yeni TEXT DEFAULT'ları ayarla.
--    (Zaten TEXT ise hata vermez.)
-- ───────────────────────────────────────

DO $$
BEGIN
  -- Kolon hâlâ ENUM ise dönüştür
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'players'
      AND column_name  = 'position'
      AND udt_name     = 'player_position'
  ) THEN
    ALTER TABLE public.players ALTER COLUMN position  DROP DEFAULT;
    ALTER TABLE public.players ALTER COLUMN foot      DROP DEFAULT;
    ALTER TABLE public.players ALTER COLUMN age_group DROP DEFAULT;

    ALTER TABLE public.players ALTER COLUMN position  TYPE TEXT USING position::TEXT;
    ALTER TABLE public.players ALTER COLUMN foot      TYPE TEXT USING foot::TEXT;
    ALTER TABLE public.players ALTER COLUMN age_group TYPE TEXT USING age_group::TEXT;

    ALTER TABLE public.players ALTER COLUMN foot SET DEFAULT 'Sağ';
  END IF;
END
$$;

-- ───────────────────────────────────────
-- 4) ESKİ ENUM TİPLERİNİ KALDIR
-- ───────────────────────────────────────

DROP TYPE IF EXISTS player_position;
DROP TYPE IF EXISTS player_foot;
DROP TYPE IF EXISTS player_age_group;

-- ───────────────────────────────────────
-- 5) RLS POLİTİKALARI (lookup tabloları)
-- ───────────────────────────────────────

ALTER TABLE public.lookup_positions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_feet       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_age_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_seasons    ENABLE ROW LEVEL SECURITY;

-- Okuma: kimliği doğrulanmış tüm kullanıcılar
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookup_positions_select') THEN
    CREATE POLICY "lookup_positions_select"  ON public.lookup_positions  FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookup_feet_select') THEN
    CREATE POLICY "lookup_feet_select"       ON public.lookup_feet       FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookup_age_groups_select') THEN
    CREATE POLICY "lookup_age_groups_select" ON public.lookup_age_groups FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookup_seasons_select') THEN
    CREATE POLICY "lookup_seasons_select"    ON public.lookup_seasons    FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;

  -- Yazma: giriş yapmış tüm kullanıcılar
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookup_positions_write') THEN
    CREATE POLICY "lookup_positions_write"  ON public.lookup_positions  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookup_feet_write') THEN
    CREATE POLICY "lookup_feet_write"       ON public.lookup_feet       FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookup_age_groups_write') THEN
    CREATE POLICY "lookup_age_groups_write" ON public.lookup_age_groups FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lookup_seasons_write') THEN
    CREATE POLICY "lookup_seasons_write"    ON public.lookup_seasons    FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END
$$;
