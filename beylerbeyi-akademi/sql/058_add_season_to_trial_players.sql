-- 058: trial_players tablosuna trial_season sütunu ekle
ALTER TABLE trial_players
  ADD COLUMN IF NOT EXISTS trial_season TEXT;
