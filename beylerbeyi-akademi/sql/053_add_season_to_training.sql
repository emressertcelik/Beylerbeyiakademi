-- ============================================================
-- training_schedules ve training_week_configs tablolarına
-- season (sezon) alanı ekle — lookup_seasons tablosundan alır
-- ============================================================

-- ── training_schedules ──────────────────────────────────────

-- 1. Önce NULL kabul eder şekilde sütun ekle
ALTER TABLE training_schedules
  ADD COLUMN IF NOT EXISTS season TEXT;

-- 2. Mevcut satırları lookup_seasons'daki en son sezonla güncelle
UPDATE training_schedules
SET season = (
  SELECT value FROM lookup_seasons
  ORDER BY sort_order DESC
  LIMIT 1
)
WHERE season IS NULL;

-- 3. NOT NULL kısıtı ekle
ALTER TABLE training_schedules
  ALTER COLUMN season SET NOT NULL;

-- 4. Eski UNIQUE kısıtını kaldır, sezon dahil yenisini ekle
ALTER TABLE training_schedules
  DROP CONSTRAINT IF EXISTS training_schedules_age_group_training_date_key;

ALTER TABLE training_schedules
  ADD CONSTRAINT training_schedules_season_age_group_date_key
  UNIQUE (season, age_group, training_date);

-- 5. Sezona göre sorgu index'i
CREATE INDEX IF NOT EXISTS idx_training_schedules_season
  ON training_schedules (season, training_date, age_group);

-- ── training_week_configs ────────────────────────────────────

-- 1. Önce NULL kabul eder şekilde sütun ekle
ALTER TABLE training_week_configs
  ADD COLUMN IF NOT EXISTS season TEXT;

-- 2. Mevcut satırları lookup_seasons'daki en son sezonla güncelle
UPDATE training_week_configs
SET season = (
  SELECT value FROM lookup_seasons
  ORDER BY sort_order DESC
  LIMIT 1
)
WHERE season IS NULL;

-- 3. NOT NULL kısıtı ekle
ALTER TABLE training_week_configs
  ALTER COLUMN season SET NOT NULL;

-- 4. Eski PK'yı kaldır, sezon dahil bileşik PK ekle
ALTER TABLE training_week_configs
  DROP CONSTRAINT IF EXISTS training_week_configs_pkey;

ALTER TABLE training_week_configs
  ADD PRIMARY KEY (season, week_start_date);
