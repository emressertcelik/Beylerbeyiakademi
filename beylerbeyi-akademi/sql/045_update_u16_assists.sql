-- =============================================
-- Migration: 045_update_u16_assists.sql
-- Beylerbeyi Akademi – U16 Oyuncu Maç Asist İstatistikleri
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

  CREATE TEMP TABLE tmp_u16_assists (
    first_name text,
    last_name  text,
    match_date date,
    assists    smallint DEFAULT 0
  ) ON COMMIT DROP;

  INSERT INTO tmp_u16_assists (first_name, last_name, match_date, assists) VALUES

  -- 3) Yusuf Kaya
  ('Yusuf','Kaya','2025-11-15', 1),
  ('Yusuf','Kaya','2025-11-22', 1),
  ('Yusuf','Kaya','2025-11-29', 1),
  ('Yusuf','Kaya','2025-12-06', 1),

  -- 5) Mehmet Kuranç
  ('Mehmet','Kuranç','2025-11-29', 1),

  -- 8) Mert Ali Günay
  ('Mert Ali','Günay','2025-10-11', 1),
  ('Mert Ali','Günay','2025-11-29', 1),

  -- 11) Hasan Kerem Turan
  ('Hasan Kerem','Turan','2025-09-20', 1),
  ('Hasan Kerem','Turan','2025-10-25', 1),
  ('Hasan Kerem','Turan','2025-12-06', 1),
  ('Hasan Kerem','Turan','2026-01-24', 1),

  -- 12) Bedreddin İlkcan Eren
  ('Bedreddin İlkcan','Eren','2025-09-20', 2),
  ('Bedreddin İlkcan','Eren','2025-10-25', 1),
  ('Bedreddin İlkcan','Eren','2025-11-08', 1),
  ('Bedreddin İlkcan','Eren','2025-11-15', 1),

  -- 14) Abdul Batın Kaçar
  ('Abdul Batın','Kaçar','2025-09-20', 2),
  ('Abdul Batın','Kaçar','2025-09-27', 2),
  ('Abdul Batın','Kaçar','2025-10-04', 1),
  ('Abdul Batın','Kaçar','2025-10-25', 1),
  ('Abdul Batın','Kaçar','2025-11-01', 1),
  ('Abdul Batın','Kaçar','2025-11-15', 2),
  ('Abdul Batın','Kaçar','2026-01-31', 2),
  ('Abdul Batın','Kaçar','2026-02-07', 1),
  ('Abdul Batın','Kaçar','2026-02-14', 1),

  -- 17) Yağız Akarsu
  ('Yağız','Akarsu','2025-10-04', 1),
  ('Yağız','Akarsu','2025-10-25', 1),
  ('Yağız','Akarsu','2025-11-01', 2),
  ('Yağız','Akarsu','2026-01-24', 1),

  -- 18) Burak Sevindik
  ('Burak','Sevindik','2025-09-20', 1),
  ('Burak','Sevindik','2025-09-27', 1),
  ('Burak','Sevindik','2025-11-15', 1),
  ('Burak','Sevindik','2025-12-06', 1),
  ('Burak','Sevindik','2026-02-07', 1),

  -- 19) Utku Uysal
  ('Utku','Uysal','2026-01-24', 1),

  -- 20) Poyraz Soğancıoğlu
  ('Poyraz','Soğancıoğlu','2025-09-20', 1),
  ('Poyraz','Soğancıoğlu','2025-11-01', 1),
  ('Poyraz','Soğancıoğlu','2025-11-08', 1),
  ('Poyraz','Soğancıoğlu','2025-11-15', 1),

  -- 21) Alperen Taş
  ('Alperen','Taş','2025-11-15', 2),
  ('Alperen','Taş','2025-11-22', 1),
  ('Alperen','Taş','2025-12-06', 1),

  -- 22) Faisal Alp Mihdavi
  ('Faisal Alp','Mihdavi','2025-11-22', 1),

  -- 23) Yusuf Boran Aydınlık
  ('Yusuf Boran','Aydınlık','2025-12-13', 1);

  -- ===== UPDATE İşlemi =====
  FOR rec IN SELECT * FROM tmp_u16_assists
  LOOP
    SELECT id INTO v_player_id
    FROM players
    WHERE first_name = rec.first_name AND last_name = rec.last_name
    LIMIT 1;

    SELECT id INTO v_match_id
    FROM matches
    WHERE date = rec.match_date AND age_group = 'U16'
    LIMIT 1;

    IF v_player_id IS NOT NULL AND v_match_id IS NOT NULL THEN
      UPDATE match_player_stats
      SET assists = assists + rec.assists
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

  RAISE NOTICE 'U16 asist güncelleme tamamlandı. Güncellenen: %, Atlanan: %', v_updated, v_skipped;
END $$;
