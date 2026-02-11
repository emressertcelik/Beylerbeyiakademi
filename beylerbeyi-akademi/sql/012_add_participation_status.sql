-- 012: Oyuncu katılım durumu (İlk 11, Sonradan Girdi, Sakat, Cezalı, Kadroda Yok)

-- 1) match_player_stats tablosuna participation_status kolonu ekle
ALTER TABLE match_player_stats ADD COLUMN IF NOT EXISTS participation_status TEXT;

-- 2) Katılım durumu lookup tablosu oluştur
CREATE TABLE IF NOT EXISTS lookup_participation_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL UNIQUE,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE lookup_participation_statuses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read participation statuses" ON lookup_participation_statuses;
CREATE POLICY "Authenticated users can read participation statuses"
  ON lookup_participation_statuses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage participation statuses" ON lookup_participation_statuses;
CREATE POLICY "Authenticated users can manage participation statuses"
  ON lookup_participation_statuses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3) Varsayılan değerleri ekle
INSERT INTO lookup_participation_statuses (value, sort_order) VALUES
  ('İlk 11', 1),
  ('Sonradan Girdi', 2),
  ('Sakat', 3),
  ('Cezalı', 4),
  ('Kadroda Yok', 5)
ON CONFLICT (value) DO NOTHING;
