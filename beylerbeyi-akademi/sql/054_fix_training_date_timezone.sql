-- ============================================================
-- Antrenman tarihlerini UTC kaymasından kurtarma
-- Sorun: toISOString() (UTC) kullanıldığından UTC+3 ortamında
--        tarihler 1 gün geri kaydedilmişti.
-- Çözüm: Tüm mevcut tarihlere +1 gün ekle.
-- ============================================================

-- training_schedules
ALTER TABLE training_schedules DROP CONSTRAINT IF EXISTS training_schedules_season_age_group_date_key;

UPDATE training_schedules
SET training_date = training_date + INTERVAL '1 day';

ALTER TABLE training_schedules
  ADD CONSTRAINT training_schedules_season_age_group_date_key
  UNIQUE (season, age_group, training_date);

-- training_week_configs
ALTER TABLE training_week_configs DROP CONSTRAINT IF EXISTS training_week_configs_pkey;

UPDATE training_week_configs
SET week_start_date = week_start_date + INTERVAL '1 day';

ALTER TABLE training_week_configs
  ADD PRIMARY KEY (season, week_start_date);
