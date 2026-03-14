-- ============================================================
-- Antrenman sıra sayacı başlangıç offseti
-- Sistem kullanılmadan önceki antrenman sayılarını tanımlar.
-- buildSessionCountMap bu değeri DB'deki sayıma ekler.
-- ============================================================

CREATE TABLE IF NOT EXISTS training_session_offsets (
  season    TEXT    NOT NULL,
  age_group TEXT    NOT NULL,
  "offset"  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (season, age_group)
);

ALTER TABLE training_session_offsets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "tso_select" ON training_session_offsets
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tso_insert" ON training_session_offsets
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'yonetici'
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tso_update" ON training_session_offsets
    FOR UPDATE TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'yonetici'
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2025-2026 sezonu başlangıç offsetleri
-- Formül: offset = hedef - mevcut_DB_kayıt_sayısı
-- Mevcut son kayıt hedef numarayı gösterir,
-- sonraki yeni antrenman hedef+1'den devam eder.
-- ============================================================

-- offset = sistem öncesi son antrenman sayısı (sabit)
-- DB'deki her kayıt bu sayıdan sonra devam eder: 1+offset, 2+offset, ...
INSERT INTO training_session_offsets (season, age_group, "offset") VALUES
  ('2025-2026', 'U19', 146),
  ('2025-2026', 'U17', 142),
  ('2025-2026', 'U16', 142),
  ('2025-2026', 'U15', 136),
  ('2025-2026', 'U14', 137),
  ('2025-2026', 'U13', 58),
  ('2025-2026', 'U12', 58)
ON CONFLICT (season, age_group) DO UPDATE
  SET "offset" = EXCLUDED."offset";
