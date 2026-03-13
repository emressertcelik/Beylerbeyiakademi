-- ============================================================
-- Antrenman Programı - Supabase Migration
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. TABLOLAR
-- ─────────────────────────────────────────────────────────────

-- Ana program tablosu (her yaş grubu + tarih için bir satır)
CREATE TABLE IF NOT EXISTS training_schedules (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group    TEXT        NOT NULL,
  training_date DATE       NOT NULL,
  -- Hücre tipi: normal antrenman, izin, maç, özel
  schedule_type TEXT       NOT NULL DEFAULT 'normal'
                           CHECK (schedule_type IN ('normal', 'izin', 'mac', 'ozel')),
  training_time TEXT,      -- '11:00', '17:30' vb. — izin günleri NULL olabilir
  cell_label   TEXT,       -- Hücrede gösterilecek özel metin (ör. 'MALTEPE A.P 17:00', 'LİG MAÇI 25.HAFTA')
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (age_group, training_date)
);

-- Antrenman detay kalemleri (her oturum için egzersiz listesi)
CREATE TABLE IF NOT EXISTS training_detail_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID        NOT NULL REFERENCES training_schedules(id) ON DELETE CASCADE,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  content     TEXT        NOT NULL,  -- ör. 'Validebağ KROS 25dk', '6x100m %70-75'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 2. INDEX'LER
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_training_schedules_date_group
  ON training_schedules (training_date, age_group);

CREATE INDEX IF NOT EXISTS idx_training_detail_items_schedule
  ON training_detail_items (schedule_id, sort_order);

-- ─────────────────────────────────────────────────────────────
-- 3. UPDATED_AT TETİKLEYİCİSİ
-- ─────────────────────────────────────────────────────────────

-- Genel updated_at fonksiyonu (daha önce yoksa oluştur)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS training_schedules_updated_at ON training_schedules;
CREATE TRIGGER training_schedules_updated_at
  BEFORE UPDATE ON training_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

ALTER TABLE training_schedules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_detail_items   ENABLE ROW LEVEL SECURITY;

-- ── training_schedules ──────────────────────────────────────

-- Tüm giriş yapmış kullanıcılar okuyabilir
CREATE POLICY "ts_select"
  ON training_schedules FOR SELECT
  TO authenticated
  USING (true);

-- Yönetici: tüm yaş grupları için INSERT
CREATE POLICY "ts_insert_yonetici"
  ON training_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'yonetici'
    )
  );

-- Antrenör: sadece kendi yaş grubu için INSERT
CREATE POLICY "ts_insert_antrenor"
  ON training_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'antrenor'
        AND age_group = training_schedules.age_group
    )
  );

-- Yönetici: tüm satırları UPDATE
CREATE POLICY "ts_update_yonetici"
  ON training_schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'yonetici'
    )
  );

-- Antrenör: sadece kendi yaş grubu satırlarını UPDATE
CREATE POLICY "ts_update_antrenor"
  ON training_schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'antrenor'
        AND age_group = training_schedules.age_group
    )
  );

-- Yönetici: tüm satırları DELETE
CREATE POLICY "ts_delete_yonetici"
  ON training_schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'yonetici'
    )
  );

-- Antrenör: sadece kendi yaş grubu satırlarını DELETE
CREATE POLICY "ts_delete_antrenor"
  ON training_schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'antrenor'
        AND age_group = training_schedules.age_group
    )
  );

-- ── training_detail_items ────────────────────────────────────

-- Tüm giriş yapmış kullanıcılar okuyabilir
CREATE POLICY "tdi_select"
  ON training_detail_items FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: schedule'ın age_group'u kendi age_group'una uyuyor olmalı (antrenör)
-- veya yönetici
CREATE POLICY "tdi_insert"
  ON training_detail_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_schedules ts
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE ts.id = training_detail_items.schedule_id
        AND (
          ur.role = 'yonetici'
          OR (ur.role = 'antrenor' AND ur.age_group = ts.age_group)
        )
    )
  );

CREATE POLICY "tdi_update"
  ON training_detail_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_schedules ts
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE ts.id = training_detail_items.schedule_id
        AND (
          ur.role = 'yonetici'
          OR (ur.role = 'antrenor' AND ur.age_group = ts.age_group)
        )
    )
  );

CREATE POLICY "tdi_delete"
  ON training_detail_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_schedules ts
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE ts.id = training_detail_items.schedule_id
        AND (
          ur.role = 'yonetici'
          OR (ur.role = 'antrenor' AND ur.age_group = ts.age_group)
        )
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 5. YORUM SATIRI - Örnek Veri (isteğe bağlı)
-- ─────────────────────────────────────────────────────────────
-- INSERT INTO training_schedules (age_group, training_date, schedule_type, training_time)
-- VALUES
--   ('U19', '2026-03-16', 'normal', '11:00'),
--   ('U19', '2026-03-17', 'normal', '11:00'),
--   ('U19', '2026-03-18', 'izin',   NULL),
--   ('U15', '2026-03-18', 'mac',    NULL, 'LİG MAÇI 25.HAFTA');
