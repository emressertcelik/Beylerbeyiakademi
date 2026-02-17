-- =============================================
-- Migration: 042_update_u14_goals.sql
-- Beylerbeyi Akademi – U14 Oyuncu Gol İstatistikleri (2025-2026 Sezonu)
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

  CREATE TEMP TABLE tmp_u14_goals (
    first_name text,
    last_name  text,
    match_date date,
    goals      smallint DEFAULT 0
  ) ON COMMIT DROP;

  INSERT INTO tmp_u14_goals (first_name, last_name, match_date, goals) VALUES

  -- ========================================
  -- 5) Ufuk Çelikten – 1 gol
  -- ========================================
  ('Ufuk','Çelikten','2026-01-03', 1),          -- W16 Beyoğlu Yeni Çarşı

  -- ========================================
  -- 7) Utku Doruk Söylemiş – 3 gol
  -- ========================================
  ('Utku Doruk','Söylemiş','2025-09-28', 1),     -- W3 Beyoğlu Yeni Çarşı
  ('Utku Doruk','Söylemiş','2025-10-19', 1),     -- W6 Panayır Spor
  ('Utku Doruk','Söylemiş','2025-12-21', 1),     -- W14 Kavacık Spor

  -- ========================================
  -- 12) Muhammed Emin Zorba – 2 gol
  -- ========================================
  ('Muhammed Emin','Zorba','2025-12-28', 1),     -- W15 İnkılap Spor
  ('Muhammed Emin','Zorba','2026-01-03', 1),     -- W16 Beyoğlu Yeni Çarşı

  -- ========================================
  -- 13) Taiga Güçlü Gündoğdu – 1 gol
  -- ========================================
  ('Taiga Güçlü','Gündoğdu','2025-10-19', 1),   -- W6 Panayır Spor

  -- ========================================
  -- 17) Mehmet Kerem Kaptan – 3 gol
  -- ========================================
  ('Mehmet Kerem','Kaptan','2025-10-19', 1),     -- W6 Panayır Spor
  ('Mehmet Kerem','Kaptan','2025-11-02', 1),     -- W8 Değirmendere Spor
  ('Mehmet Kerem','Kaptan','2025-11-16', 1),     -- W10 Sakarya Tek Spor

  -- ========================================
  -- 18) Tuna Baykal – 1 gol
  -- ========================================
  ('Tuna','Baykal','2025-10-12', 1),             -- W5 Kestel Çilek

  -- ========================================
  -- 19) Mehmet Cengizhan Kirazlı – 1 gol
  -- ========================================
  ('Mehmet Cengizhan','Kirazlı','2025-12-21', 1), -- W14 Kavacık Spor

  -- ========================================
  -- 20) Berkay Koçhan – 16 gol (gol kralı)
  -- ========================================
  ('Berkay','Koçhan','2025-09-21', 2),           -- W2 İnkılap Spor
  ('Berkay','Koçhan','2025-09-28', 1),           -- W3 Beyoğlu Yeni Çarşı
  ('Berkay','Koçhan','2025-10-12', 1),           -- W5 Kestel Çilek
  ('Berkay','Koçhan','2025-10-26', 2),           -- W7 Gebze Spor
  ('Berkay','Koçhan','2025-11-09', 1),           -- W9 Gölcük Spor
  ('Berkay','Koçhan','2025-11-16', 4),           -- W10 Sakarya Tek Spor
  ('Berkay','Koçhan','2025-11-23', 1),           -- W11 Zara Ekinli
  ('Berkay','Koçhan','2025-11-30', 1),           -- W12 Bulvar Spor
  ('Berkay','Koçhan','2025-12-07', 3),           -- W13 Karacabey Belediye
  ('Berkay','Koçhan','2025-12-21', 1),           -- W14 Kavacık Spor

  -- ========================================
  -- 23) Ali Çopuroğlu – 1 gol
  -- ========================================
  ('Ali','Çopuroğlu','2025-11-16', 1),           -- W10 Sakarya Tek Spor

  -- ========================================
  -- 26) Efe Özkan – 2 gol
  -- ========================================
  ('Efe','Özkan','2025-12-28', 1),               -- W15 İnkılap Spor
  ('Efe','Özkan','2026-01-03', 1),               -- W16 Beyoğlu Yeni Çarşı

  -- ========================================
  -- 29) Çınar Yalçın – 2 gol
  -- ========================================
  ('Çınar','Yalçın','2026-01-03', 2);            -- W16 Beyoğlu Yeni Çarşı

  -- ===== UPDATE İşlemi =====
  FOR rec IN SELECT * FROM tmp_u14_goals
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

  RAISE NOTICE 'U14 gol güncelleme tamamlandı. Güncellenen: %, Atlanan: %', v_updated, v_skipped;
END $$;
