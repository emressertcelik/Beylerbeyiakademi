-- =============================================
-- Migration: 043_update_u14_assists.sql
-- Beylerbeyi Akademi – U14 Oyuncu Asist İstatistikleri (2025-2026 Sezonu)
-- Mevcut match_player_stats kayıtlarını günceller (Hafta 1-16)
-- =============================================

DO $$
DECLARE
  rec RECORD;
  v_match_id uuid;
  v_player_id uuid;
  v_updated int := 0;
  v_skipped int := 0;
BEGIN

  CREATE TEMP TABLE tmp_u14_assists (
    first_name text,
    last_name  text,
    match_date date,
    assists    smallint DEFAULT 0
  ) ON COMMIT DROP;

  INSERT INTO tmp_u14_assists (first_name, last_name, match_date, assists) VALUES

  -- ========================================
  -- 3) Bertuğ Erdoğan Başoğlu – 1 asist
  -- ========================================
  ('Bertuğ Erdoğan','Başoğlu','2025-09-28', 1),     -- W3 Beyoğlu Yeni Çarşı

  -- ========================================
  -- 12) Muhammed Emin Zorba – 1 asist
  -- ========================================
  ('Muhammed Emin','Zorba','2025-11-16', 1),         -- W10 Sakarya Tek Spor

  -- ========================================
  -- 13) Taiga Güçlü Gündoğdu – 1 asist
  -- ========================================
  ('Taiga Güçlü','Gündoğdu','2025-09-28', 1),       -- W3 Beyoğlu Yeni Çarşı

  -- ========================================
  -- 17) Mehmet Kerem Kaptan – 2 asist
  -- ========================================
  ('Mehmet Kerem','Kaptan','2025-09-21', 1),         -- W2 İnkılap Spor
  ('Mehmet Kerem','Kaptan','2025-10-26', 1),         -- W7 Gebze Spor

  -- ========================================
  -- 18) Tuna Baykal – 4 asist
  -- ========================================
  ('Tuna','Baykal','2025-10-19', 1),                 -- W6 Panayır Spor
  ('Tuna','Baykal','2025-10-26', 1),                 -- W7 Gebze Spor
  ('Tuna','Baykal','2025-11-16', 1),                 -- W10 Sakarya Tek Spor
  ('Tuna','Baykal','2025-12-28', 1),                 -- W15 İnkılap Spor

  -- ========================================
  -- 19) Mehmet Cengizhan Kirazlı – 2 asist
  -- ========================================
  ('Mehmet Cengizhan','Kirazlı','2025-09-21', 1),   -- W2 İnkılap Spor
  ('Mehmet Cengizhan','Kirazlı','2025-11-16', 1),   -- W10 Sakarya Tek Spor

  -- ========================================
  -- 22) Ahmet Berk Alkış – 1 asist
  -- ========================================
  ('Ahmet Berk','Alkış','2026-01-03', 1),            -- W16 Beyoğlu Yeni Çarşı

  -- ========================================
  -- 23) Ali Çopuroğlu – 2 asist
  -- ========================================
  ('Ali','Çopuroğlu','2025-10-26', 1),               -- W7 Gebze Spor
  ('Ali','Çopuroğlu','2025-11-23', 1),               -- W11 Zara Ekinli

  -- ========================================
  -- 25) Çınar Yağız Ekmen – 2 asist
  -- ========================================
  ('Çınar Yağız','Ekmen','2025-11-30', 1),           -- W12 Bulvar Spor
  ('Çınar Yağız','Ekmen','2025-12-07', 1);           -- W13 Karacabey Belediye

  -- ===== UPDATE İşlemi =====
  FOR rec IN SELECT * FROM tmp_u14_assists
  LOOP
    -- Oyuncuyu bul (U14 öncelikli)
    SELECT id INTO v_player_id
    FROM players
    WHERE first_name = rec.first_name AND last_name = rec.last_name
    ORDER BY CASE WHEN age_group = 'U14' THEN 0 ELSE 1 END
    LIMIT 1;

    -- Maçı bul (U14)
    SELECT id INTO v_match_id
    FROM matches
    WHERE date = rec.match_date AND age_group = 'U14'
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

  RAISE NOTICE 'U14 asist güncelleme tamamlandı. Güncellenen: %, Atlanan: %', v_updated, v_skipped;
END $$;
