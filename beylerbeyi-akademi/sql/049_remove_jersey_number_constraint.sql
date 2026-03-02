-- Forma numarası artık kullanılmadığından sütunun zorunluluğunu kaldır
ALTER TABLE public.players
  ALTER COLUMN jersey_number DROP NOT NULL,
  ALTER COLUMN jersey_number SET DEFAULT NULL;

ALTER TABLE public.players
  DROP CONSTRAINT IF EXISTS players_jersey_number_check;

-- İlgili index'i de kaldır
DROP INDEX IF EXISTS public.idx_players_jersey;
