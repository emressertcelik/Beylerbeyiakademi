-- =============================================
-- Migration: 028_relax_height_weight_constraints.sql
-- Boy ve kilo kısıtlamalarını kaldır (0 veya herhangi bir değer girilebilsin)
-- =============================================

ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_height_check;
ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_weight_check;

-- Sadece negatif olmasın yeterli
ALTER TABLE public.players ADD CONSTRAINT players_height_check CHECK (height IS NULL OR height >= 0);
ALTER TABLE public.players ADD CONSTRAINT players_weight_check CHECK (weight IS NULL OR weight >= 0);
