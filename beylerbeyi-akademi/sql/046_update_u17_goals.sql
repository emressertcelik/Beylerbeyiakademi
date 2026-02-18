-- =============================================
-- Migration: 046_update_u17_goals.sql
-- Beylerbeyi Akademi – U17 Oyuncu Maç Gol İstatistikleri
-- Mevcut match_player_stats kayıtlarını günceller
-- =============================================

DO $$
DECLARE
  rec RECORD;
  v_match_id uuid;
  v_player_id uuid;
  v_updated int := 0;
  v_skipped int := 0;
BEGIN

  CREATE TEMP TABLE tmp_u17_goals (
    first_name text,
    last_name  text,
    match_date date,
    goals      smallint DEFAULT 0
  ) ON COMMIT DROP;

  INSERT INTO tmp_u17_goals (first_name, last_name, match_date, goals) VALUES

  -- 3) Emirhan Çelik
  ('Emirhan','Çelik','2025-09-20', 1),
  ('Emirhan','Çelik','2025-10-25', 1),
  ('Emirhan','Çelik','2025-11-08', 1),
  ('Emirhan','Çelik','2025-11-22', 1),

  -- 4) Behzat Aras Aydın
  ('Behzat Aras','Aydın','2025-11-08', 1),

  -- 6) Arda Çoruk
  ('Arda','Çoruk','2025-10-25', 1),
  ('Arda','Çoruk','2025-11-01', 1),
  ('Arda','Çoruk','2026-01-24', 1),

  -- 13) Alperen Varol
  ('Alperen','Varol','2025-09-27', 2),
  ('Alperen','Varol','2025-11-22', 1),
  ('Alperen','Varol','2025-12-06', 1),
  ('Alperen','Varol','2025-12-13', 1),
  ('Alperen','Varol','2026-01-17', 1),

  -- 17) Yiğit Efe Tepe
  ('Yiğit Efe','Tepe','2026-01-17', 1),

  -- 18) Eren Alp Koçak
  ('Eren Alp','Koçak','2025-10-04', 1),
  ('Eren Alp','Koçak','2025-10-25', 1),

  -- 19) Ömer Faruk Özkanca
  ('Ömer Faruk','Özkanca','2025-09-20', 1),
  ('Ömer Faruk','Özkanca','2025-10-18', 2),
  ('Ömer Faruk','Özkanca','2025-10-25', 1),
  ('Ömer Faruk','Özkanca','2025-11-01', 2),
  ('Ömer Faruk','Özkanca','2025-11-15', 2),
  ('Ömer Faruk','Özkanca','2025-11-22', 1),
  ('Ömer Faruk','Özkanca','2025-12-06', 1),
  ('Ömer Faruk','Özkanca','2025-12-13', 2),
  ('Ömer Faruk','Özkanca','2026-01-17', 2),

  -- 20) Batuhan Öncel
  ('Batuhan','Öncel','2025-09-20', 1),
  ('Batuhan','Öncel','2025-10-04', 1),
  ('Batuhan','Öncel','2025-11-15', 1),
  ('Batuhan','Öncel','2026-01-10', 1),
  ('Batuhan','Öncel','2026-01-17', 1),

  -- 21) Bedreddin İlkcan Eren (U16 oyuncusu, U17'de oynuyor)
  ('Bedreddin İlkcan','Eren','2026-01-17', 1),

  -- 22) Yusuf Kaya (U16 oyuncusu, U17'de oynuyor)
  ('Yusuf','Kaya','2026-01-31', 1);

  -- ===== UPDATE İşlemi =====
  FOR rec IN SELECT * FROM tmp_u17_goals
  LOOP
    SELECT id INTO v_player_id
    FROM players
    WHERE first_name = rec.first_name AND last_name = rec.last_name
    LIMIT 1;

    SELECT id INTO v_match_id
    FROM matches
    WHERE date = rec.match_date AND age_group = 'U17'
    LIMIT 1;

    IF v_player_id IS NOT NULL AND v_match_id IS NOT NULL THEN
      UPDATE match_player_stats
      SET goals = goals + rec.goals
      WHERE match_id = v_match_id
        AND player_id = v_player_id;

      IF FOUND THEN
        v_updated := v_updated + 1;
      ELSE
        RAISE NOTICE 'Kayıt bulunamadı: % % – %', rec.first_name, rec.last_name, rec.match_date;
        v_skipped := v_skipped + 1;
      END IF;
    ELSE
      RAISE NOTICE 'Oyuncu/maç bulunamadı: % % – %', rec.first_name, rec.last_name, rec.match_date;
      v_skipped := v_skipped + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'U17 gol güncelleme tamamlandı. Güncellenen: %, Atlanan: %', v_updated, v_skipped;
END $$;
