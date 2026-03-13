-- ============================================================
-- Antrenman Haftası Numarası Konfigürasyonu
-- ============================================================

CREATE TABLE IF NOT EXISTS training_week_configs (
  week_start_date DATE        PRIMARY KEY,   -- Pazartesi (haftanın başı)
  training_week_number INTEGER NOT NULL,      -- Antrenman haftası numarası (1, 2, 3 …)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS training_week_configs_updated_at ON training_week_configs;
CREATE TRIGGER training_week_configs_updated_at
  BEFORE UPDATE ON training_week_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE training_week_configs ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "twc_select"
  ON training_week_configs FOR SELECT TO authenticated USING (true);

-- Yönetici veya antrenör ekleyebilir / güncelleyebilir
CREATE POLICY "twc_insert"
  ON training_week_configs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('yonetici', 'antrenor')
    )
  );

CREATE POLICY "twc_update"
  ON training_week_configs FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('yonetici', 'antrenor')
    )
  );
