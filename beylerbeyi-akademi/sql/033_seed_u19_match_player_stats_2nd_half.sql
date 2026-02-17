-- =============================================
-- Migration: 033_seed_u19_match_player_stats_2nd_half.sql
-- Beylerbeyi Akademi – U19 2. Yarı Oyuncu Maç İstatistikleri (Hafta 16-21)
-- =============================================

DO $$
DECLARE
  rec RECORD;
  v_match_id uuid;
  v_player_id uuid;
  v_player_name text;
  v_jersey smallint;
  v_pos text;
  v_minutes smallint;
  v_status text;
BEGIN

  CREATE TEMP TABLE tmp_u19_stats_2 (
    first_name text,
    last_name text,
    match_date date,
    stat_value text
  ) ON COMMIT DROP;

  INSERT INTO tmp_u19_stats_2 (first_name, last_name, match_date, stat_value) VALUES

  -- 1) Ömür Çilesiz
  ('Ömür','Çilesiz','2025-12-29','SA'),
  ('Ömür','Çilesiz','2026-01-07','SA'),
  ('Ömür','Çilesiz','2026-01-14','90'),
  ('Ömür','Çilesiz','2026-01-21','90'),
  ('Ömür','Çilesiz','2026-01-28','90'),
  ('Ömür','Çilesiz','2026-02-04','SA'),

  -- 2) Sinan Sargın
  ('Sinan','Sargın','2025-12-29','90'),
  ('Sinan','Sargın','2026-01-07','90'),
  ('Sinan','Sargın','2026-01-14','S'),
  ('Sinan','Sargın','2026-01-21','SA'),
  ('Sinan','Sargın','2026-01-28','SA'),
  ('Sinan','Sargın','2026-02-04','90'),

  -- 3) Emirhan Çelik (U17)
  ('Emirhan','Çelik','2025-12-29','45'),
  ('Emirhan','Çelik','2026-01-07','90'),
  ('Emirhan','Çelik','2026-01-14','90'),
  ('Emirhan','Çelik','2026-01-21','90'),
  ('Emirhan','Çelik','2026-01-28','90'),
  ('Emirhan','Çelik','2026-02-04','90'),

  -- 4) Yasin Erdem Öztürk
  ('Yasin Erdem','Öztürk','2025-12-29','S'),
  ('Yasin Erdem','Öztürk','2026-01-07','S'),
  ('Yasin Erdem','Öztürk','2026-01-14','S'),
  ('Yasin Erdem','Öztürk','2026-01-21','S'),
  ('Yasin Erdem','Öztürk','2026-01-28','S'),
  ('Yasin Erdem','Öztürk','2026-02-04','S'),

  -- 5) Yasin Albayrak
  ('Yasin','Albayrak','2025-12-29','90'),
  ('Yasin','Albayrak','2026-01-07','90'),
  ('Yasin','Albayrak','2026-01-14','90'),
  ('Yasin','Albayrak','2026-01-21','C'),
  ('Yasin','Albayrak','2026-01-28','90'),
  ('Yasin','Albayrak','2026-02-04','90'),

  -- 6) Ulaç Kandaz
  ('Ulaç','Kandaz','2025-12-29','87'),
  ('Ulaç','Kandaz','2026-01-07','90'),
  ('Ulaç','Kandaz','2026-01-14','90'),
  ('Ulaç','Kandaz','2026-01-21','90'),
  ('Ulaç','Kandaz','2026-01-28','90'),
  ('Ulaç','Kandaz','2026-02-04','C'),

  -- 7) Metehan Coşkun
  ('Metehan','Coşkun','2025-12-29','90'),
  ('Metehan','Coşkun','2026-01-07','90'),
  ('Metehan','Coşkun','2026-01-14','65'),
  ('Metehan','Coşkun','2026-01-21','90'),
  ('Metehan','Coşkun','2026-01-28','45'),
  ('Metehan','Coşkun','2026-02-04','90'),

  -- 8) Umut Egemen Kutlu
  ('Umut Egemen','Kutlu','2025-12-29','S'),
  ('Umut Egemen','Kutlu','2026-01-07','S'),
  ('Umut Egemen','Kutlu','2026-01-14','S'),
  ('Umut Egemen','Kutlu','2026-01-21','S'),
  ('Umut Egemen','Kutlu','2026-01-28','S'),
  ('Umut Egemen','Kutlu','2026-02-04','S'),

  -- 9) Miraç Emir Yıldız
  ('Miraç Emir','Yıldız','2025-12-29','5'),
  ('Miraç Emir','Yıldız','2026-01-07','SA'),
  ('Miraç Emir','Yıldız','2026-01-14','25'),
  ('Miraç Emir','Yıldız','2026-01-21','45'),

  -- 10) Arda Ayvalı
  ('Arda','Ayvalı','2025-12-29','SA'),
  ('Arda','Ayvalı','2026-01-07','SA'),
  ('Arda','Ayvalı','2026-01-14','90'),
  ('Arda','Ayvalı','2026-01-21','45'),
  ('Arda','Ayvalı','2026-01-28','SA'),
  ('Arda','Ayvalı','2026-02-04','35'),

  -- 11) Türker Çebi
  ('Türker','Çebi','2025-12-29','45'),
  ('Türker','Çebi','2026-01-07','90'),
  ('Türker','Çebi','2026-01-14','SA'),
  ('Türker','Çebi','2026-01-21','SA'),
  ('Türker','Çebi','2026-01-28','70'),
  ('Türker','Çebi','2026-02-04','SA'),

  -- 12) Ege Barış Demir
  ('Ege Barış','Demir','2025-12-29','70'),
  ('Ege Barış','Demir','2026-01-07','64'),
  ('Ege Barış','Demir','2026-01-14','90'),
  ('Ege Barış','Demir','2026-01-21','90'),
  ('Ege Barış','Demir','2026-01-28','90'),
  ('Ege Barış','Demir','2026-02-04','90'),

  -- 13) Arda Çoruk (U17)
  ('Arda','Çoruk','2025-12-29','90'),
  ('Arda','Çoruk','2026-01-07','SA'),
  ('Arda','Çoruk','2026-01-21','45'),
  ('Arda','Çoruk','2026-01-28','20'),
  ('Arda','Çoruk','2026-02-04','90'),

  -- 14) Umut Bak
  ('Umut','Bak','2025-12-29','20'),
  ('Umut','Bak','2026-01-07','SA'),
  ('Umut','Bak','2026-01-14','SA'),
  ('Umut','Bak','2026-01-21','SA'),
  ('Umut','Bak','2026-01-28','SA'),

  -- 16) Kadir Gedik
  ('Kadir','Gedik','2025-12-29','55'),
  ('Kadir','Gedik','2026-01-07','45'),
  ('Kadir','Gedik','2026-01-14','32'),
  ('Kadir','Gedik','2026-01-21','C'),
  ('Kadir','Gedik','2026-01-28','45'),
  ('Kadir','Gedik','2026-02-04','45'),

  -- 17) Alperen Varol (U17)
  ('Alperen','Varol','2025-12-29','35'),
  ('Alperen','Varol','2026-01-07','25'),
  ('Alperen','Varol','2026-01-14','SA'),
  ('Alperen','Varol','2026-01-21','63'),
  ('Alperen','Varol','2026-01-28','45'),
  ('Alperen','Varol','2026-02-04','45'),

  -- 18) Yiğit Yazıcı
  ('Yiğit','Yazıcı','2025-12-29','90'),
  ('Yiğit','Yazıcı','2026-01-14','25'),
  ('Yiğit','Yazıcı','2026-01-21','30'),
  ('Yiğit','Yazıcı','2026-01-28','76'),
  ('Yiğit','Yazıcı','2026-02-04','70'),

  -- 19) Emir Kama
  ('Emir','Kama','2025-12-29','S'),
  ('Emir','Kama','2026-01-07','SA'),

  -- 20) Emir Kalkan
  ('Emir','Kalkan','2025-12-29','S'),

  -- 22) Berk Davulcu
  ('Berk','Davulcu','2025-12-29','90'),
  ('Berk','Davulcu','2026-01-07','45'),
  ('Berk','Davulcu','2026-01-14','45'),
  ('Berk','Davulcu','2026-01-21','75'),
  ('Berk','Davulcu','2026-01-28','45'),

  -- 23) Eyüp Silmez
  ('Eyüp','Silmez','2025-12-29','70'),
  ('Eyüp','Silmez','2026-01-07','90'),
  ('Eyüp','Silmez','2026-01-14','85'),
  ('Eyüp','Silmez','2026-01-21','90'),
  ('Eyüp','Silmez','2026-01-28','90'),
  ('Eyüp','Silmez','2026-02-04','90'),

  -- 24) Alp Değirmenci
  ('Alp','Değirmenci','2025-12-29','SA'),
  ('Alp','Değirmenci','2026-01-07','45'),
  ('Alp','Değirmenci','2026-01-14','5'),
  ('Alp','Değirmenci','2026-01-21','SA'),
  ('Alp','Değirmenci','2026-01-28','25'),

  -- 25) Halit Yıldırım
  ('Halit','Yıldırım','2025-12-29','20'),
  ('Halit','Yıldırım','2026-01-07','25'),
  ('Halit','Yıldırım','2026-01-14','SA'),
  ('Halit','Yıldırım','2026-01-21','20'),
  ('Halit','Yıldırım','2026-01-28','SA'),
  ('Halit','Yıldırım','2026-02-04','SA'),

  -- 26) Eren Alp Koçak (U17)
  ('Eren Alp','Koçak','2025-12-29','S'),
  ('Eren Alp','Koçak','2026-01-14','45'),
  ('Eren Alp','Koçak','2026-01-21','75'),
  ('Eren Alp','Koçak','2026-01-28','45'),
  ('Eren Alp','Koçak','2026-02-04','45'),

  -- 27) Ömer Faruk Özkanca (U17)
  ('Ömer Faruk','Özkanca','2025-12-29','45'),
  ('Ömer Faruk','Özkanca','2026-01-07','45'),
  ('Ömer Faruk','Özkanca','2026-01-14','S'),
  ('Ömer Faruk','Özkanca','2026-01-21','45'),

  -- 28) Yiğit Efe Tepe (U17)
  ('Yiğit Efe','Tepe','2025-12-29','SA'),
  ('Yiğit Efe','Tepe','2026-01-14','SA'),
  ('Yiğit Efe','Tepe','2026-01-21','SA'),
  ('Yiğit Efe','Tepe','2026-01-28','SA'),
  ('Yiğit Efe','Tepe','2026-02-04','SA'),

  -- 29) Batuhan Öncel (U17)
  ('Batuhan','Öncel','2025-12-29','SA'),
  ('Batuhan','Öncel','2026-01-07','25'),
  ('Batuhan','Öncel','2026-01-14','65'),
  ('Batuhan','Öncel','2026-01-21','32'),
  ('Batuhan','Öncel','2026-02-04','SA'),

  -- 30) Kuzey Ömer Durak (U17)
  ('Kuzey Ömer','Durak','2026-01-28','45');

  -- ===== İşleme =====
  FOR rec IN SELECT * FROM tmp_u19_stats_2
  LOOP
    SELECT id, first_name || ' ' || last_name, jersey_number, position::text
    INTO v_player_id, v_player_name, v_jersey, v_pos
    FROM players
    WHERE first_name = rec.first_name AND last_name = rec.last_name
    LIMIT 1;

    SELECT id INTO v_match_id
    FROM matches
    WHERE date = rec.match_date AND age_group = 'U19'
    LIMIT 1;

    IF v_player_id IS NOT NULL AND v_match_id IS NOT NULL THEN
      IF rec.stat_value = 'SA' THEN
        v_minutes := 0; v_status := 'sakat';
      ELSIF rec.stat_value = 'C' THEN
        v_minutes := 0; v_status := 'cezali';
      ELSIF rec.stat_value = 'S' THEN
        v_minutes := 0; v_status := NULL;
      ELSIF rec.stat_value ~ '^\d+$' THEN
        v_minutes := rec.stat_value::smallint; v_status := NULL;
      ELSE
        v_minutes := 0; v_status := NULL;
      END IF;

      INSERT INTO match_player_stats (
        id, match_id, player_id, player_name, jersey_number, position,
        participation_status, minutes_played, goals, assists,
        yellow_cards, red_cards, goals_conceded, clean_sheet
      ) VALUES (
        gen_random_uuid(), v_match_id, v_player_id, v_player_name, v_jersey, v_pos,
        v_status, v_minutes, 0, 0,
        0, 0, 0, false
      )
      ON CONFLICT (match_id, player_id) DO NOTHING;
    END IF;
  END LOOP;

  RAISE NOTICE 'U19 2. yarı oyuncu istatistikleri eklendi.';
END $$;
