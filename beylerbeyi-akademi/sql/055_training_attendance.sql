-- ============================================================
-- Antrenman Yoklama Tablosu
-- Her antrenman oturumu için oyuncu bazlı katılım durumu
-- ============================================================

CREATE TABLE training_attendance (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID        NOT NULL REFERENCES training_schedules(id) ON DELETE CASCADE,
  player_id   UUID        NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL
                          CHECK (status IN ('geldi', 'gelmedi', 'izinli', 'sakat')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (schedule_id, player_id)
);

-- Index: schedule_id üzerinden hızlı sorgulama
CREATE INDEX idx_training_attendance_schedule
  ON training_attendance (schedule_id);

-- updated_at otomatik güncelleme (fonksiyon 051'de oluşturuldu)
CREATE TRIGGER training_attendance_updated_at
  BEFORE UPDATE ON training_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE training_attendance ENABLE ROW LEVEL SECURITY;

-- Tüm giriş yapmış kullanıcılar okuyabilir
CREATE POLICY "ta_select"
  ON training_attendance FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: yönetici veya kendi yaş grubundaki antrenör
CREATE POLICY "ta_insert"
  ON training_attendance FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_schedules ts
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE ts.id = training_attendance.schedule_id
        AND (
          ur.role = 'yonetici'
          OR (ur.role = 'antrenor' AND ur.age_group = ts.age_group)
        )
    )
  );

-- UPDATE: yönetici veya kendi yaş grubundaki antrenör
CREATE POLICY "ta_update"
  ON training_attendance FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_schedules ts
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE ts.id = training_attendance.schedule_id
        AND (
          ur.role = 'yonetici'
          OR (ur.role = 'antrenor' AND ur.age_group = ts.age_group)
        )
    )
  );

-- DELETE: yönetici veya kendi yaş grubundaki antrenör
CREATE POLICY "ta_delete"
  ON training_attendance FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_schedules ts
      JOIN user_roles ur ON ur.user_id = auth.uid()
      WHERE ts.id = training_attendance.schedule_id
        AND (
          ur.role = 'yonetici'
          OR (ur.role = 'antrenor' AND ur.age_group = ts.age_group)
        )
    )
  );
