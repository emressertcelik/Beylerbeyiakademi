-- 010: Maç kadrosu, maç saati, toplanma bilgileri
-- matches tablosuna yeni alanlar ekleniyor

-- Maç saati
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_time TEXT;

-- Toplanma saati
ALTER TABLE matches ADD COLUMN IF NOT EXISTS gathering_time TEXT;

-- Toplanma yeri
ALTER TABLE matches ADD COLUMN IF NOT EXISTS gathering_location TEXT;

-- Maç kadrosu (JSONB array: [{playerId, playerName, jerseyNumber, position}])
ALTER TABLE matches ADD COLUMN IF NOT EXISTS squad JSONB DEFAULT '[]'::jsonb;
