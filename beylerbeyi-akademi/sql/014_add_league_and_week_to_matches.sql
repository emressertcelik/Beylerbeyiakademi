-- 014_add_league_and_week_to_matches.sql
-- Maç tablosuna lig adı ve hafta alanı eklenmesi

ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS week SMALLINT;
