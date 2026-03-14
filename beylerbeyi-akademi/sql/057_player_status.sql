-- ============================================================
-- Oyuncu aktif/pasif durumu
-- ============================================================

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'passive')),
  ADD COLUMN IF NOT EXISTS passive_reason TEXT
    CHECK (passive_reason IN ('gonderildi', 'ayrildi', 'transfer') OR passive_reason IS NULL),
  ADD COLUMN IF NOT EXISTS passive_note TEXT;
