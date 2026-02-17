-- =============================================
-- Migration: 034_update_u19_goals_cards.sql
-- Beylerbeyi Akademi – U19 Oyuncu Maç İstatistikleri (Gol, Asist, Sarı Kart, Kırmızı Kart)
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

  CREATE TEMP TABLE tmp_u19_cards_goals (
    first_name text,
    last_name  text,
    match_date date,
    goals      smallint DEFAULT 0,
    assists    smallint DEFAULT 0,
    yellow_cards smallint DEFAULT 0,
    red_cards  smallint DEFAULT 0
  ) ON COMMIT DROP;

  INSERT INTO tmp_u19_cards_goals (first_name, last_name, match_date, goals, assists, yellow_cards, red_cards) VALUES

  -- ============ GOL ============

  -- 3) Emirhan Çelik
  ('Emirhan','Çelik','2025-11-05', 1, 0, 0, 0),

  -- 7) Metehan Coşkun
  ('Metehan','Coşkun','2025-10-29', 1, 0, 0, 0),

  -- 12) Ege Barış Demir
  ('Ege Barış','Demir','2025-12-10', 1, 0, 0, 0),

  -- 16) Kadir Gedik
  ('Kadir','Gedik','2025-12-10', 1, 0, 0, 0),

  -- 17) Alperen Varol
  ('Alperen','Varol','2025-11-05', 1, 0, 0, 0),

  -- 22) Berk Davulcu
  ('Berk','Davulcu','2025-10-15', 1, 0, 0, 0),
  ('Berk','Davulcu','2025-11-05', 1, 0, 0, 0),
  ('Berk','Davulcu','2025-12-10', 1, 0, 0, 0),

  -- 23) Eyüp Silmez
  ('Eyüp','Silmez','2025-09-17', 1, 0, 0, 0),
  ('Eyüp','Silmez','2025-09-24', 1, 0, 0, 0),
  ('Eyüp','Silmez','2025-11-12', 1, 0, 0, 0),
  ('Eyüp','Silmez','2025-12-29', 2, 0, 0, 0),
  ('Eyüp','Silmez','2026-01-14', 2, 0, 0, 0),
  ('Eyüp','Silmez','2026-01-21', 1, 0, 0, 0),
  ('Eyüp','Silmez','2026-01-28', 1, 0, 0, 0),

  -- 24) Alp Değirmenci
  ('Alp','Değirmenci','2025-10-08', 1, 0, 0, 0),

  -- 25) Halit Yıldırım
  ('Halit','Yıldırım','2025-11-05', 2, 0, 0, 0),
  ('Halit','Yıldırım','2025-11-12', 1, 0, 0, 0),
  ('Halit','Yıldırım','2025-12-10', 1, 0, 0, 0),

  -- 27) Ömer Faruk Özkanca
  ('Ömer Faruk','Özkanca','2025-12-17', 1, 1, 0, 0),

  -- ============ ASİST ============

  -- 10) Arda Ayvalı
  ('Arda','Ayvalı','2025-10-08', 0, 1, 0, 0),

  -- 12) Ege Barış Demir
  ('Ege Barış','Demir','2026-01-14', 0, 1, 0, 0),

  -- 15) Berkay Üst
  ('Berkay','Üst','2025-11-05', 0, 1, 0, 0),

  -- 16) Kadir Gedik
  ('Kadir','Gedik','2025-10-01', 0, 1, 0, 0),
  ('Kadir','Gedik','2025-10-15', 0, 1, 0, 0),
  ('Kadir','Gedik','2025-11-26', 0, 1, 0, 0),

  -- 17) Alperen Varol
  ('Alperen','Varol','2025-11-12', 0, 2, 0, 0),
  ('Alperen','Varol','2025-12-29', 0, 2, 0, 0),
  ('Alperen','Varol','2026-01-07', 0, 2, 0, 0),

  -- 23) Eyüp Silmez
  ('Eyüp','Silmez','2025-11-19', 0, 1, 0, 0),

  -- 25) Halit Yıldırım
  ('Halit','Yıldırım','2025-11-05', 0, 1, 0, 0),

  -- 27) Ömer Faruk Özkanca (asist 2025-12-17 yukarıda gol ile birlikte)

  -- ============ SARI KART (SK) ============

  -- 3) Emirhan Çelik
  ('Emirhan','Çelik','2025-12-29', 0, 0, 1, 0),

  -- 5) Yasin Albayrak
  ('Yasin','Albayrak','2025-10-01', 0, 0, 1, 0),
  ('Yasin','Albayrak','2025-10-08', 0, 0, 1, 0),
  ('Yasin','Albayrak','2025-11-12', 0, 0, 1, 0),
  ('Yasin','Albayrak','2026-01-14', 0, 0, 1, 0),
  ('Yasin','Albayrak','2026-01-28', 0, 0, 1, 0),
  ('Yasin','Albayrak','2026-02-04', 0, 0, 1, 0),

  -- 6) Ulaç Kandaz
  ('Ulaç','Kandaz','2025-10-01', 0, 0, 1, 0),

  -- 7) Metehan Coşkun
  ('Metehan','Coşkun','2025-10-22', 0, 0, 1, 0),
  ('Metehan','Coşkun','2025-11-12', 0, 0, 1, 0),
  ('Metehan','Coşkun','2025-11-26', 0, 0, 1, 0),
  ('Metehan','Coşkun','2025-12-03', 0, 0, 1, 0),
  ('Metehan','Coşkun','2026-01-28', 0, 0, 1, 0),
  ('Metehan','Coşkun','2026-02-04', 0, 0, 1, 0),

  -- 9) Miraç Emir Yıldız
  ('Miraç Emir','Yıldız','2025-09-17', 0, 0, 1, 0),

  -- 10) Arda Ayvalı
  ('Arda','Ayvalı','2025-12-10', 0, 0, 1, 0),

  -- 11) Türker Çebi
  ('Türker','Çebi','2025-10-15', 0, 0, 1, 0),
  ('Türker','Çebi','2025-12-29', 0, 0, 1, 0),

  -- 12) Ege Barış Demir
  ('Ege Barış','Demir','2025-09-24', 0, 0, 1, 0),
  ('Ege Barış','Demir','2025-10-08', 0, 0, 1, 0),
  ('Ege Barış','Demir','2025-10-29', 0, 0, 1, 0),
  ('Ege Barış','Demir','2025-11-05', 0, 0, 1, 0),
  ('Ege Barış','Demir','2026-01-14', 0, 0, 1, 0),
  ('Ege Barış','Demir','2026-01-28', 0, 0, 1, 0),
  ('Ege Barış','Demir','2026-02-04', 0, 0, 1, 0),

  -- 14) Umut Bak
  ('Umut','Bak','2025-09-17', 0, 0, 1, 0),
  ('Umut','Bak','2025-09-24', 0, 0, 1, 0),

  -- 16) Kadir Gedik
  ('Kadir','Gedik','2025-10-22', 0, 0, 1, 0),
  ('Kadir','Gedik','2025-11-19', 0, 0, 1, 0),
  ('Kadir','Gedik','2025-12-03', 0, 0, 1, 0),
  ('Kadir','Gedik','2026-01-14', 0, 0, 1, 0),

  -- 17) Alperen Varol
  ('Alperen','Varol','2025-12-17', 0, 0, 1, 0),

  -- 18) Yiğit Yazıcı
  ('Yiğit','Yazıcı','2025-11-19', 0, 0, 1, 0),

  -- 22) Berk Davulcu
  ('Berk','Davulcu','2025-12-03', 0, 0, 1, 0),

  -- 24) Alp Değirmenci
  ('Alp','Değirmenci','2025-11-12', 0, 0, 1, 0),
  ('Alp','Değirmenci','2025-11-19', 0, 0, 1, 0),

  -- 25) Halit Yıldırım
  ('Halit','Yıldırım','2025-11-19', 0, 0, 1, 0),

  -- 29) Batuhan Öncel
  ('Batuhan','Öncel','2026-01-28', 0, 0, 1, 0),

  -- ============ KIRMIZI KART (KK) ============

  -- 23) Eyüp Silmez
  ('Eyüp','Silmez','2025-10-08', 0, 0, 0, 1),

  -- 16) Kadir Gedik
  ('Kadir','Gedik','2025-12-17', 0, 0, 0, 1),

  -- 27) Ömer Faruk Özkanca
  ('Ömer Faruk','Özkanca','2025-11-05', 0, 0, 0, 1);

  -- ===== UPDATE İşlemi =====
  FOR rec IN SELECT * FROM tmp_u19_cards_goals
  LOOP
    -- Oyuncuyu bul
    SELECT id INTO v_player_id
    FROM players
    WHERE first_name = rec.first_name AND last_name = rec.last_name
    LIMIT 1;

    -- Maçı bul
    SELECT id INTO v_match_id
    FROM matches
    WHERE date = rec.match_date AND age_group = 'U19'
    LIMIT 1;

    IF v_player_id IS NOT NULL AND v_match_id IS NOT NULL THEN
      UPDATE match_player_stats
      SET
        goals        = goals        + rec.goals,
        assists      = assists      + rec.assists,
        yellow_cards = yellow_cards + rec.yellow_cards,
        red_cards    = red_cards    + rec.red_cards
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

  RAISE NOTICE 'U19 gol/asist/kart güncelleme tamamlandı. Güncellenen: %, Atlanan: %', v_updated, v_skipped;
END $$;
