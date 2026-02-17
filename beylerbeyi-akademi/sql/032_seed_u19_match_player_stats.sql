-- =============================================
-- Migration: 032_seed_u19_match_player_stats.sql
-- Beylerbeyi Akademi – U19 1. Yarı Oyuncu Maç İstatistikleri
-- Değerler: Dakika (sayı), SA=Sakat, C=Cezalı, S=Yedek(oynamadı), KY=Kadroda Yok (eklenmez)
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

  -- Geçici tablo: ham veri
  CREATE TEMP TABLE tmp_u19_stats (
    first_name text,
    last_name text,
    match_date date,
    stat_value text
  ) ON COMMIT DROP;

  INSERT INTO tmp_u19_stats (first_name, last_name, match_date, stat_value) VALUES

  -- 1) Ömür Çilesiz
  ('Ömür','Çilesiz','2025-12-24','SA'),

  -- 2) Sinan Sargın
  ('Sinan','Sargın','2025-09-17','SA'),
  ('Sinan','Sargın','2025-09-24','90'),
  ('Sinan','Sargın','2025-10-01','90'),
  ('Sinan','Sargın','2025-10-08','90'),
  ('Sinan','Sargın','2025-10-15','SA'),
  ('Sinan','Sargın','2025-10-22','90'),
  ('Sinan','Sargın','2025-10-29','90'),
  ('Sinan','Sargın','2025-11-05','35'),
  ('Sinan','Sargın','2025-11-12','90'),
  ('Sinan','Sargın','2025-11-19','90'),
  ('Sinan','Sargın','2025-11-26','90'),
  ('Sinan','Sargın','2025-12-03','90'),
  ('Sinan','Sargın','2025-12-10','90'),
  ('Sinan','Sargın','2025-12-17','90'),
  ('Sinan','Sargın','2025-12-24','90'),

  -- 3) Emirhan Çelik (U17 oyuncusu, U19 maçlarında oynuyor)
  ('Emirhan','Çelik','2025-10-29','45'),
  ('Emirhan','Çelik','2025-11-05','90'),
  ('Emirhan','Çelik','2025-11-12','90'),
  ('Emirhan','Çelik','2025-11-26','45'),
  ('Emirhan','Çelik','2025-12-03','90'),
  ('Emirhan','Çelik','2025-12-10','90'),
  ('Emirhan','Çelik','2025-12-17','75'),
  ('Emirhan','Çelik','2025-12-24','90'),

  -- 4) Yasin Erdem Öztürk
  ('Yasin Erdem','Öztürk','2025-09-17','SA'),
  ('Yasin Erdem','Öztürk','2025-09-24','SA'),
  ('Yasin Erdem','Öztürk','2025-10-01','SA'),
  ('Yasin Erdem','Öztürk','2025-10-08','SA'),
  ('Yasin Erdem','Öztürk','2025-10-15','90'),
  ('Yasin Erdem','Öztürk','2025-10-22','45'),
  ('Yasin Erdem','Öztürk','2025-10-29','S'),
  ('Yasin Erdem','Öztürk','2025-11-05','S'),
  ('Yasin Erdem','Öztürk','2025-11-12','S'),
  ('Yasin Erdem','Öztürk','2025-11-19','S'),
  ('Yasin Erdem','Öztürk','2025-11-26','S'),
  ('Yasin Erdem','Öztürk','2025-12-03','S'),
  ('Yasin Erdem','Öztürk','2025-12-10','S'),
  ('Yasin Erdem','Öztürk','2025-12-17','S'),
  ('Yasin Erdem','Öztürk','2025-12-24','S'),

  -- 5) Yasin Albayrak
  ('Yasin','Albayrak','2025-09-17','90'),
  ('Yasin','Albayrak','2025-10-01','90'),
  ('Yasin','Albayrak','2025-10-08','90'),
  ('Yasin','Albayrak','2025-10-15','SA'),
  ('Yasin','Albayrak','2025-10-22','SA'),
  ('Yasin','Albayrak','2025-10-29','90'),
  ('Yasin','Albayrak','2025-11-05','90'),
  ('Yasin','Albayrak','2025-11-12','90'),
  ('Yasin','Albayrak','2025-11-19','90'),
  ('Yasin','Albayrak','2025-11-26','90'),
  ('Yasin','Albayrak','2025-12-03','50'),
  ('Yasin','Albayrak','2025-12-10','90'),
  ('Yasin','Albayrak','2025-12-17','90'),
  ('Yasin','Albayrak','2025-12-24','90'),

  -- 6) Ulaç Kandaz
  ('Ulaç','Kandaz','2025-10-01','80'),
  ('Ulaç','Kandaz','2025-10-08','45'),
  ('Ulaç','Kandaz','2025-10-15','90'),
  ('Ulaç','Kandaz','2025-10-22','78'),
  ('Ulaç','Kandaz','2025-10-29','SA'),
  ('Ulaç','Kandaz','2025-11-05','SA'),
  ('Ulaç','Kandaz','2025-11-12','SA'),
  ('Ulaç','Kandaz','2025-11-19','90'),
  ('Ulaç','Kandaz','2025-11-26','90'),
  ('Ulaç','Kandaz','2025-12-03','90'),
  ('Ulaç','Kandaz','2025-12-10','90'),
  ('Ulaç','Kandaz','2025-12-17','90'),
  ('Ulaç','Kandaz','2025-12-24','90'),

  -- 7) Metehan Coşkun
  ('Metehan','Coşkun','2025-10-01','30'),
  ('Metehan','Coşkun','2025-10-08','90'),
  ('Metehan','Coşkun','2025-10-15','90'),
  ('Metehan','Coşkun','2025-10-22','90'),
  ('Metehan','Coşkun','2025-10-29','90'),
  ('Metehan','Coşkun','2025-11-05','90'),
  ('Metehan','Coşkun','2025-11-12','90'),
  ('Metehan','Coşkun','2025-11-19','SA'),
  ('Metehan','Coşkun','2025-11-26','45'),
  ('Metehan','Coşkun','2025-12-03','90'),
  ('Metehan','Coşkun','2025-12-10','90'),
  ('Metehan','Coşkun','2025-12-17','C'),
  ('Metehan','Coşkun','2025-12-24','90'),

  -- 8) Umut Egemen Kutlu
  ('Umut Egemen','Kutlu','2025-09-17','SA'),
  ('Umut Egemen','Kutlu','2025-09-24','90'),
  ('Umut Egemen','Kutlu','2025-10-29','SA'),
  ('Umut Egemen','Kutlu','2025-11-05','SA'),
  ('Umut Egemen','Kutlu','2025-11-12','SA'),
  ('Umut Egemen','Kutlu','2025-11-19','SA'),
  ('Umut Egemen','Kutlu','2025-11-26','SA'),
  ('Umut Egemen','Kutlu','2025-12-03','S'),
  ('Umut Egemen','Kutlu','2025-12-10','S'),
  ('Umut Egemen','Kutlu','2025-12-17','S'),
  ('Umut Egemen','Kutlu','2025-12-24','S'),

  -- 9) Miraç Emir Yıldız
  ('Miraç Emir','Yıldız','2025-09-17','90'),
  ('Miraç Emir','Yıldız','2025-09-24','61'),
  ('Miraç Emir','Yıldız','2025-10-01','SA'),
  ('Miraç Emir','Yıldız','2025-10-15','SA'),
  ('Miraç Emir','Yıldız','2025-10-22','90'),
  ('Miraç Emir','Yıldız','2025-10-29','45'),
  ('Miraç Emir','Yıldız','2025-11-05','65'),
  ('Miraç Emir','Yıldız','2025-11-12','90'),
  ('Miraç Emir','Yıldız','2025-11-19','SA'),
  ('Miraç Emir','Yıldız','2025-11-26','45'),
  ('Miraç Emir','Yıldız','2025-12-03','SA'),
  ('Miraç Emir','Yıldız','2025-12-10','SA'),
  ('Miraç Emir','Yıldız','2025-12-17','5'),
  ('Miraç Emir','Yıldız','2025-12-24','SA'),

  -- 10) Arda Ayvalı
  ('Arda','Ayvalı','2025-09-17','90'),
  ('Arda','Ayvalı','2025-09-24','90'),
  ('Arda','Ayvalı','2025-10-01','90'),
  ('Arda','Ayvalı','2025-10-08','90'),
  ('Arda','Ayvalı','2025-10-15','81'),
  ('Arda','Ayvalı','2025-10-22','90'),
  ('Arda','Ayvalı','2025-10-29','45'),
  ('Arda','Ayvalı','2025-11-05','45'),
  ('Arda','Ayvalı','2025-11-12','90'),
  ('Arda','Ayvalı','2025-11-19','90'),
  ('Arda','Ayvalı','2025-11-26','90'),
  ('Arda','Ayvalı','2025-12-03','60'),
  ('Arda','Ayvalı','2025-12-10','90'),
  ('Arda','Ayvalı','2025-12-17','90'),
  ('Arda','Ayvalı','2025-12-24','45'),

  -- 11) Türker Çebi
  ('Türker','Çebi','2025-09-17','16'),
  ('Türker','Çebi','2025-09-24','61'),
  ('Türker','Çebi','2025-10-01','22'),
  ('Türker','Çebi','2025-10-08','SA'),
  ('Türker','Çebi','2025-10-15','10'),
  ('Türker','Çebi','2025-10-22','SA'),
  ('Türker','Çebi','2025-10-29','90'),
  ('Türker','Çebi','2025-11-05','45'),
  ('Türker','Çebi','2025-11-12','SA'),
  ('Türker','Çebi','2025-11-19','SA'),
  ('Türker','Çebi','2025-11-26','SA'),
  ('Türker','Çebi','2025-12-03','30'),
  ('Türker','Çebi','2025-12-10','SA'),
  ('Türker','Çebi','2025-12-17','SA'),
  ('Türker','Çebi','2025-12-24','45'),

  -- 12) Ege Barış Demir
  ('Ege Barış','Demir','2025-09-17','45'),
  ('Ege Barış','Demir','2025-09-24','90'),
  ('Ege Barış','Demir','2025-10-01','90'),
  ('Ege Barış','Demir','2025-10-08','45'),
  ('Ege Barış','Demir','2025-10-15','70'),
  ('Ege Barış','Demir','2025-10-22','55'),
  ('Ege Barış','Demir','2025-10-29','90'),
  ('Ege Barış','Demir','2025-11-05','45'),
  ('Ege Barış','Demir','2025-11-12','C'),
  ('Ege Barış','Demir','2025-11-19','90'),
  ('Ege Barış','Demir','2025-11-26','90'),
  ('Ege Barış','Demir','2025-12-03','45'),
  ('Ege Barış','Demir','2025-12-10','86'),
  ('Ege Barış','Demir','2025-12-17','63'),
  ('Ege Barış','Demir','2025-12-24','75'),

  -- 13) Arda Çoruk (U17 oyuncusu)
  ('Arda','Çoruk','2025-12-24','SA'),

  -- 14) Umut Bak
  ('Umut','Bak','2025-09-17','45'),
  ('Umut','Bak','2025-09-24','84'),
  ('Umut','Bak','2025-10-01','15'),
  ('Umut','Bak','2025-10-08','35'),
  ('Umut','Bak','2025-10-15','S'),
  ('Umut','Bak','2025-10-22','S'),
  ('Umut','Bak','2025-10-29','S'),
  ('Umut','Bak','2025-11-05','S'),
  ('Umut','Bak','2025-11-12','S'),
  ('Umut','Bak','2025-11-19','S'),
  ('Umut','Bak','2025-11-26','S'),
  ('Umut','Bak','2025-12-03','S'),
  ('Umut','Bak','2025-12-10','S'),
  ('Umut','Bak','2025-12-17','SA'),
  ('Umut','Bak','2025-12-24','SA'),

  -- 15) Berkay Üst
  ('Berkay','Üst','2025-09-17','45'),
  ('Berkay','Üst','2025-09-24','45'),
  ('Berkay','Üst','2025-10-01','35'),
  ('Berkay','Üst','2025-10-08','45'),
  ('Berkay','Üst','2025-10-15','90'),
  ('Berkay','Üst','2025-10-22','90'),
  ('Berkay','Üst','2025-10-29','82'),
  ('Berkay','Üst','2025-11-05','90'),
  ('Berkay','Üst','2025-11-12','70'),
  ('Berkay','Üst','2025-11-19','90'),

  -- 16) Kadir Gedik
  ('Kadir','Gedik','2025-09-17','61'),
  ('Kadir','Gedik','2025-09-24','45'),
  ('Kadir','Gedik','2025-10-01','60'),
  ('Kadir','Gedik','2025-10-08','45'),
  ('Kadir','Gedik','2025-10-15','65'),
  ('Kadir','Gedik','2025-10-22','35'),
  ('Kadir','Gedik','2025-10-29','75'),
  ('Kadir','Gedik','2025-11-12','20'),
  ('Kadir','Gedik','2025-11-19','16'),
  ('Kadir','Gedik','2025-11-26','70'),
  ('Kadir','Gedik','2025-12-03','90'),
  ('Kadir','Gedik','2025-12-10','62'),
  ('Kadir','Gedik','2025-12-17','80'),
  ('Kadir','Gedik','2025-12-24','C'),

  -- 17) Alperen Varol (U17 oyuncusu)
  ('Alperen','Varol','2025-10-22','78'),
  ('Alperen','Varol','2025-10-29','59'),
  ('Alperen','Varol','2025-11-05','45'),
  ('Alperen','Varol','2025-11-12','30'),
  ('Alperen','Varol','2025-11-26','20'),
  ('Alperen','Varol','2025-12-03','45'),
  ('Alperen','Varol','2025-12-10','25'),
  ('Alperen','Varol','2025-12-17','90'),
  ('Alperen','Varol','2025-12-24','25'),

  -- 18) Yiğit Yazıcı
  ('Yiğit','Yazıcı','2025-09-17','90'),
  ('Yiğit','Yazıcı','2025-09-24','61'),
  ('Yiğit','Yazıcı','2025-10-01','45'),
  ('Yiğit','Yazıcı','2025-10-08','30'),
  ('Yiğit','Yazıcı','2025-10-15','45'),
  ('Yiğit','Yazıcı','2025-10-22','SA'),
  ('Yiğit','Yazıcı','2025-10-29','8'),
  ('Yiğit','Yazıcı','2025-11-05','SA'),
  ('Yiğit','Yazıcı','2025-11-12','60'),
  ('Yiğit','Yazıcı','2025-11-19','12'),
  ('Yiğit','Yazıcı','2025-11-26','25'),
  ('Yiğit','Yazıcı','2025-12-03','10'),
  ('Yiğit','Yazıcı','2025-12-17','45'),
  ('Yiğit','Yazıcı','2025-12-24','20'),

  -- 19) Emir Kama
  ('Emir','Kama','2025-09-17','SA'),
  ('Emir','Kama','2025-09-24','17'),
  ('Emir','Kama','2025-10-01','8'),
  ('Emir','Kama','2025-10-08','SA'),
  ('Emir','Kama','2025-10-15','30'),
  ('Emir','Kama','2025-10-22','45'),
  ('Emir','Kama','2025-10-29','SA'),
  ('Emir','Kama','2025-11-05','SA'),
  ('Emir','Kama','2025-11-12','SA'),
  ('Emir','Kama','2025-11-19','65'),
  ('Emir','Kama','2025-11-26','45'),
  ('Emir','Kama','2025-12-03','SA'),
  ('Emir','Kama','2025-12-10','S'),
  ('Emir','Kama','2025-12-17','S'),
  ('Emir','Kama','2025-12-24','S'),

  -- 20) Emir Kalkan
  ('Emir','Kalkan','2025-10-01','45'),
  ('Emir','Kalkan','2025-10-08','70'),
  ('Emir','Kalkan','2025-10-15','SA'),
  ('Emir','Kalkan','2025-10-22','S'),
  ('Emir','Kalkan','2025-10-29','S'),
  ('Emir','Kalkan','2025-11-05','S'),
  ('Emir','Kalkan','2025-11-12','S'),
  ('Emir','Kalkan','2025-11-19','S'),
  ('Emir','Kalkan','2025-11-26','S'),
  ('Emir','Kalkan','2025-12-03','S'),
  ('Emir','Kalkan','2025-12-10','S'),
  ('Emir','Kalkan','2025-12-17','S'),
  ('Emir','Kalkan','2025-12-24','S'),

  -- 21) Poyraz Baş
  ('Poyraz','Baş','2025-10-15','45'),
  ('Poyraz','Baş','2025-10-22','90'),
  ('Poyraz','Baş','2025-10-29','90'),
  ('Poyraz','Baş','2025-11-05','90'),
  ('Poyraz','Baş','2025-11-12','90'),
  ('Poyraz','Baş','2025-11-19','78'),
  ('Poyraz','Baş','2025-12-03','80'),
  ('Poyraz','Baş','2025-12-10','45'),

  -- 22) Berk Davulcu
  ('Berk','Davulcu','2025-09-17','90'),
  ('Berk','Davulcu','2025-09-24','90'),
  ('Berk','Davulcu','2025-10-01','60'),
  ('Berk','Davulcu','2025-10-08','45'),
  ('Berk','Davulcu','2025-10-15','45'),
  ('Berk','Davulcu','2025-10-22','73'),
  ('Berk','Davulcu','2025-10-29','59'),
  ('Berk','Davulcu','2025-11-05','65'),
  ('Berk','Davulcu','2025-11-12','70'),
  ('Berk','Davulcu','2025-11-19','SA'),
  ('Berk','Davulcu','2025-11-26','85'),
  ('Berk','Davulcu','2025-12-03','90'),
  ('Berk','Davulcu','2025-12-10','90'),
  ('Berk','Davulcu','2025-12-17','90'),
  ('Berk','Davulcu','2025-12-24','90'),

  -- 23) Eyüp Silmez
  ('Eyüp','Silmez','2025-09-17','90'),
  ('Eyüp','Silmez','2025-09-24','90'),
  ('Eyüp','Silmez','2025-10-01','87'),
  ('Eyüp','Silmez','2025-10-08','90'),
  ('Eyüp','Silmez','2025-10-15','67'),
  ('Eyüp','Silmez','2025-10-22','C'),
  ('Eyüp','Silmez','2025-10-29','C'),
  ('Eyüp','Silmez','2025-11-05','C'),
  ('Eyüp','Silmez','2025-11-12','30'),
  ('Eyüp','Silmez','2025-11-19','90'),
  ('Eyüp','Silmez','2025-11-26','90'),
  ('Eyüp','Silmez','2025-12-03','90'),
  ('Eyüp','Silmez','2025-12-10','90'),
  ('Eyüp','Silmez','2025-12-17','45'),
  ('Eyüp','Silmez','2025-12-24','90'),

  -- 24) Alp Değirmenci
  ('Alp','Değirmenci','2025-09-17','30'),
  ('Alp','Değirmenci','2025-09-24','30'),
  ('Alp','Değirmenci','2025-10-01','35'),
  ('Alp','Değirmenci','2025-10-08','45'),
  ('Alp','Değirmenci','2025-10-15','S'),
  ('Alp','Değirmenci','2025-10-22','S'),
  ('Alp','Değirmenci','2025-10-29','S'),
  ('Alp','Değirmenci','2025-11-05','S'),
  ('Alp','Değirmenci','2025-11-12','20'),
  ('Alp','Değirmenci','2025-11-19','74'),
  ('Alp','Değirmenci','2025-11-26','SA'),
  ('Alp','Değirmenci','2025-12-03','SA'),
  ('Alp','Değirmenci','2025-12-10','5'),
  ('Alp','Değirmenci','2025-12-17','30'),
  ('Alp','Değirmenci','2025-12-24','45'),

  -- 25) Halit Yıldırım
  ('Halit','Yıldırım','2025-09-17','45'),
  ('Halit','Yıldırım','2025-09-24','SA'),
  ('Halit','Yıldırım','2025-10-22','17'),
  ('Halit','Yıldırım','2025-10-29','15'),
  ('Halit','Yıldırım','2025-11-05','90'),
  ('Halit','Yıldırım','2025-11-12','60'),
  ('Halit','Yıldırım','2025-11-19','90'),
  ('Halit','Yıldırım','2025-11-26','65'),
  ('Halit','Yıldırım','2025-12-03','40'),
  ('Halit','Yıldırım','2025-12-10','45'),
  ('Halit','Yıldırım','2025-12-17','72'),
  ('Halit','Yıldırım','2025-12-24','65'),

  -- 26) Eren Alp Koçak (U17 oyuncusu)
  ('Eren Alp','Koçak','2025-10-22','45'),
  ('Eren Alp','Koçak','2025-10-29','45'),
  ('Eren Alp','Koçak','2025-11-05','25'),
  ('Eren Alp','Koçak','2025-11-12','S'),
  ('Eren Alp','Koçak','2025-11-19','S'),
  ('Eren Alp','Koçak','2025-11-26','S'),
  ('Eren Alp','Koçak','2025-12-03','S'),
  ('Eren Alp','Koçak','2025-12-10','S'),
  ('Eren Alp','Koçak','2025-12-17','S'),
  ('Eren Alp','Koçak','2025-12-24','S'),

  -- 27) Ömer Faruk Özkanca (U17 oyuncusu)
  ('Ömer Faruk','Özkanca','2025-11-05','25'),
  ('Ömer Faruk','Özkanca','2025-11-26','6'),
  ('Ömer Faruk','Özkanca','2025-12-03','SA'),
  ('Ömer Faruk','Özkanca','2025-12-10','SA'),
  ('Ömer Faruk','Özkanca','2025-12-17','20'),
  ('Ömer Faruk','Özkanca','2025-12-24','20'),

  -- 28) Yiğit Efe Tepe (U17 oyuncusu)
  ('Yiğit Efe','Tepe','2025-12-24','25');

  -- ===== İşleme =====
  FOR rec IN SELECT * FROM tmp_u19_stats
  LOOP
    -- Oyuncuyu bul (isim eşleşmesi, yaş grubu farketmez)
    SELECT id, first_name || ' ' || last_name, jersey_number, position::text
    INTO v_player_id, v_player_name, v_jersey, v_pos
    FROM players
    WHERE first_name = rec.first_name AND last_name = rec.last_name
    LIMIT 1;

    -- Maçı bul
    SELECT id INTO v_match_id
    FROM matches
    WHERE date = rec.match_date AND age_group = 'U19'
    LIMIT 1;

    -- Her ikisi de bulunduysa istatistiği ekle
    IF v_player_id IS NOT NULL AND v_match_id IS NOT NULL THEN

      -- Değeri yorumla
      IF rec.stat_value = 'SA' THEN
        v_minutes := 0;
        v_status := 'sakat';
      ELSIF rec.stat_value = 'C' THEN
        v_minutes := 0;
        v_status := 'cezali';
      ELSIF rec.stat_value = 'S' THEN
        v_minutes := 0;
        v_status := NULL;
      ELSIF rec.stat_value ~ '^\d+$' THEN
        v_minutes := rec.stat_value::smallint;
        v_status := NULL;
      ELSE
        v_minutes := 0;
        v_status := NULL;
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

  RAISE NOTICE 'U19 1. yarı oyuncu istatistikleri eklendi.';
END $$;
