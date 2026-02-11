-- =============================================
-- Migration: 008_add_match_status
-- Maçlara status kolonu ekle (scheduled / played)
-- Bu dosya tekrar tekrar çalıştırılabilir (idempotent).
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.matches ADD COLUMN status TEXT NOT NULL DEFAULT 'played' CHECK (status IN ('scheduled', 'played'));
  END IF;
END
$$;

-- Mevcut result kolonunun DEFAULT değeri yoksa ekle
ALTER TABLE public.matches ALTER COLUMN result SET DEFAULT 'D';
