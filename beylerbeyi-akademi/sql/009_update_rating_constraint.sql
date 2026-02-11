-- =============================================
-- Migration: 009_update_rating_constraint
-- Rating aralığını 1-10'dan 1-5'e güncelle (yıldız sistemi)
-- Bu dosya tekrar tekrar çalıştırılabilir (idempotent).
-- =============================================

DO $$
BEGIN
  -- Eski constraint'i kaldır
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name LIKE '%rating%'
      AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.match_player_stats DROP CONSTRAINT IF EXISTS match_player_stats_rating_check;
  END IF;

  -- Yeni 1-5 constraint ekle
  ALTER TABLE public.match_player_stats
    ADD CONSTRAINT match_player_stats_rating_check
    CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5));
END
$$;
