-- =============================================
-- Migration: 037_seed_u17_match_player_stats.sql
-- Beylerbeyi Akademi – U17 Oyuncu Maç İstatistikleri (2025-2026 Sezonu)
-- Hafta 1-18 (Tüm Sezon)
-- SA = Saha dışı (yedek/oynamadı), SAKAT = Sakatlandı, C = Cezalı
-- HASTA = Hasta, KD = Kırmızı kart diskalifiyesi
-- Boş hücreler (oyuncu kadroda yok) eklenmez.
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



  -- 2) Geçici tablo: ham veri
  CREATE TEMP TABLE tmp_u17_stats (
    first_name text,
    last_name text,
    match_date date,
    stat_value text
  ) ON COMMIT DROP;

  INSERT INTO tmp_u17_stats (first_name, last_name, match_date, stat_value) VALUES

  -- ========================================
  -- 1) Yusuf Arda Ceylan (18 kayıt)
  -- ========================================
  ('Yusuf Arda','Ceylan','2025-09-20','90'),
  ('Yusuf Arda','Ceylan','2025-09-27','90'),
  ('Yusuf Arda','Ceylan','2025-10-04','SA'),
  ('Yusuf Arda','Ceylan','2025-10-11','90'),
  ('Yusuf Arda','Ceylan','2025-10-18','90'),
  ('Yusuf Arda','Ceylan','2025-10-25','90'),
  ('Yusuf Arda','Ceylan','2025-11-01','SAKAT'),
  ('Yusuf Arda','Ceylan','2025-11-08','SA'),
  ('Yusuf Arda','Ceylan','2025-11-15','90'),
  ('Yusuf Arda','Ceylan','2025-11-22','90'),
  ('Yusuf Arda','Ceylan','2025-11-29','SA'),
  ('Yusuf Arda','Ceylan','2025-12-06','SA'),
  ('Yusuf Arda','Ceylan','2025-12-13','90'),
  ('Yusuf Arda','Ceylan','2026-01-10','SA'),
  ('Yusuf Arda','Ceylan','2026-01-17','90'),
  ('Yusuf Arda','Ceylan','2026-01-24','SA'),
  ('Yusuf Arda','Ceylan','2026-01-31','SA'),
  ('Yusuf Arda','Ceylan','2026-02-07','SA'),

  -- ========================================
  -- 2) Miraç Göktuğ Dural (18 kayıt)
  -- ========================================
  ('Miraç Göktuğ','Dural','2025-09-20','SA'),
  ('Miraç Göktuğ','Dural','2025-09-27','SA'),
  ('Miraç Göktuğ','Dural','2025-10-04','90'),
  ('Miraç Göktuğ','Dural','2025-10-11','SA'),
  ('Miraç Göktuğ','Dural','2025-10-18','SA'),
  ('Miraç Göktuğ','Dural','2025-10-25','SA'),
  ('Miraç Göktuğ','Dural','2025-11-01','90'),
  ('Miraç Göktuğ','Dural','2025-11-08','SA'),
  ('Miraç Göktuğ','Dural','2025-11-15','SA'),
  ('Miraç Göktuğ','Dural','2025-11-22','SA'),
  ('Miraç Göktuğ','Dural','2025-11-29','SA'),
  ('Miraç Göktuğ','Dural','2025-12-06','90'),
  ('Miraç Göktuğ','Dural','2025-12-13','SA'),
  ('Miraç Göktuğ','Dural','2026-01-10','90'),
  ('Miraç Göktuğ','Dural','2026-01-17','SA'),
  ('Miraç Göktuğ','Dural','2026-01-24','90'),
  ('Miraç Göktuğ','Dural','2026-01-31','90'),
  ('Miraç Göktuğ','Dural','2026-02-07','90'),

  -- ========================================
  -- 3) Emirhan Çelik (17 kayıt – W12 kadroda yok)
  -- ========================================
  ('Emirhan','Çelik','2025-09-20','90'),
  ('Emirhan','Çelik','2025-09-27','90'),
  ('Emirhan','Çelik','2025-10-04','90'),
  ('Emirhan','Çelik','2025-10-11','90'),
  ('Emirhan','Çelik','2025-10-18','90'),
  ('Emirhan','Çelik','2025-10-25','90'),
  ('Emirhan','Çelik','2025-11-01','55'),
  ('Emirhan','Çelik','2025-11-08','45'),
  ('Emirhan','Çelik','2025-11-15','90'),
  ('Emirhan','Çelik','2025-11-22','90'),
  ('Emirhan','Çelik','2025-11-29','90'),
  -- W12 (2025-12-06) kadroda yok
  ('Emirhan','Çelik','2025-12-13','90'),
  ('Emirhan','Çelik','2026-01-10','90'),
  ('Emirhan','Çelik','2026-01-17','80'),
  ('Emirhan','Çelik','2026-01-24','90'),
  ('Emirhan','Çelik','2026-01-31','85'),
  ('Emirhan','Çelik','2026-02-07','90'),

  -- ========================================
  -- 4) Behzat Aras Aydın (16 kayıt – W8, W16 kadroda yok)
  -- ========================================
  ('Behzat Aras','Aydın','2025-09-20','90'),
  ('Behzat Aras','Aydın','2025-09-27','90'),
  ('Behzat Aras','Aydın','2025-10-04','90'),
  ('Behzat Aras','Aydın','2025-10-11','90'),
  ('Behzat Aras','Aydın','2025-10-18','90'),
  ('Behzat Aras','Aydın','2025-10-25','90'),
  ('Behzat Aras','Aydın','2025-11-01','90'),
  -- W8 (2025-11-08) kadroda yok
  ('Behzat Aras','Aydın','2025-11-15','90'),
  ('Behzat Aras','Aydın','2025-11-22','90'),
  ('Behzat Aras','Aydın','2025-11-29','90'),
  ('Behzat Aras','Aydın','2025-12-06','55'),
  ('Behzat Aras','Aydın','2025-12-13','90'),
  ('Behzat Aras','Aydın','2026-01-10','90'),
  ('Behzat Aras','Aydın','2026-01-17','90'),
  -- W16 (2026-01-24) kadroda yok
  ('Behzat Aras','Aydın','2026-01-31','SA'),
  ('Behzat Aras','Aydın','2026-02-07','90'),

  -- ========================================
  -- 5) Mustafa Emir Yavuz (17 kayıt – W18 kadroda yok)
  -- ========================================
  ('Mustafa Emir','Yavuz','2025-09-20','5'),
  ('Mustafa Emir','Yavuz','2025-09-27','30'),
  ('Mustafa Emir','Yavuz','2025-10-04','C'),
  ('Mustafa Emir','Yavuz','2025-10-11','70'),
  ('Mustafa Emir','Yavuz','2025-10-18','90'),
  ('Mustafa Emir','Yavuz','2025-10-25','75'),
  ('Mustafa Emir','Yavuz','2025-11-01','90'),
  ('Mustafa Emir','Yavuz','2025-11-08','90'),
  ('Mustafa Emir','Yavuz','2025-11-15','90'),
  ('Mustafa Emir','Yavuz','2025-11-22','90'),
  ('Mustafa Emir','Yavuz','2025-11-29','85'),
  ('Mustafa Emir','Yavuz','2025-12-06','65'),
  ('Mustafa Emir','Yavuz','2025-12-13','SA'),
  ('Mustafa Emir','Yavuz','2026-01-10','10'),
  ('Mustafa Emir','Yavuz','2026-01-17','SA'),
  ('Mustafa Emir','Yavuz','2026-01-24','90'),
  ('Mustafa Emir','Yavuz','2026-01-31','90'),
  -- W18 (2026-02-07) kadroda yok

  -- ========================================
  -- 6) Arda Çoruk (18 kayıt)
  -- ========================================
  ('Arda','Çoruk','2025-09-20','90'),
  ('Arda','Çoruk','2025-09-27','90'),
  ('Arda','Çoruk','2025-10-04','90'),
  ('Arda','Çoruk','2025-10-11','20'),
  ('Arda','Çoruk','2025-10-18','C'),
  ('Arda','Çoruk','2025-10-25','90'),
  ('Arda','Çoruk','2025-11-01','90'),
  ('Arda','Çoruk','2025-11-08','85'),
  ('Arda','Çoruk','2025-11-15','C'),
  ('Arda','Çoruk','2025-11-22','90'),
  ('Arda','Çoruk','2025-11-29','90'),
  ('Arda','Çoruk','2025-12-06','90'),
  ('Arda','Çoruk','2025-12-13','90'),
  ('Arda','Çoruk','2026-01-10','90'),
  ('Arda','Çoruk','2026-01-17','90'),
  ('Arda','Çoruk','2026-01-24','90'),
  ('Arda','Çoruk','2026-01-31','90'),
  ('Arda','Çoruk','2026-02-07','90'),

  -- ========================================
  -- 7) Yusuf Berkut Hızlı (18 kayıt)
  -- ========================================
  ('Yusuf Berkut','Hızlı','2025-09-20','80'),
  ('Yusuf Berkut','Hızlı','2025-09-27','90'),
  ('Yusuf Berkut','Hızlı','2025-10-04','80'),
  ('Yusuf Berkut','Hızlı','2025-10-11','70'),
  ('Yusuf Berkut','Hızlı','2025-10-18','70'),
  ('Yusuf Berkut','Hızlı','2025-10-25','60'),
  ('Yusuf Berkut','Hızlı','2025-11-01','90'),
  ('Yusuf Berkut','Hızlı','2025-11-08','90'),
  ('Yusuf Berkut','Hızlı','2025-11-15','85'),
  ('Yusuf Berkut','Hızlı','2025-11-22','75'),
  ('Yusuf Berkut','Hızlı','2025-11-29','75'),
  ('Yusuf Berkut','Hızlı','2025-12-06','25'),
  ('Yusuf Berkut','Hızlı','2025-12-13','10'),
  ('Yusuf Berkut','Hızlı','2026-01-10','5'),
  ('Yusuf Berkut','Hızlı','2026-01-17','15'),
  ('Yusuf Berkut','Hızlı','2026-01-24','10'),
  ('Yusuf Berkut','Hızlı','2026-01-31','5'),
  ('Yusuf Berkut','Hızlı','2026-02-07','15'),

  -- ========================================
  -- 8) Mustafa Erinç Bayram (18 kayıt)
  -- ========================================
  ('Mustafa Erinç','Bayram','2025-09-20','10'),
  ('Mustafa Erinç','Bayram','2025-09-27','SA'),
  ('Mustafa Erinç','Bayram','2025-10-04','10'),
  ('Mustafa Erinç','Bayram','2025-10-11','SA'),
  ('Mustafa Erinç','Bayram','2025-10-18','25'),
  ('Mustafa Erinç','Bayram','2025-10-25','15'),
  ('Mustafa Erinç','Bayram','2025-11-01','15'),
  ('Mustafa Erinç','Bayram','2025-11-08','SA'),
  ('Mustafa Erinç','Bayram','2025-11-15','10'),
  ('Mustafa Erinç','Bayram','2025-11-22','SA'),
  ('Mustafa Erinç','Bayram','2025-11-29','45'),
  ('Mustafa Erinç','Bayram','2025-12-06','5'),
  ('Mustafa Erinç','Bayram','2025-12-13','SA'),
  ('Mustafa Erinç','Bayram','2026-01-10','SA'),
  ('Mustafa Erinç','Bayram','2026-01-17','10'),
  ('Mustafa Erinç','Bayram','2026-01-24','SA'),
  ('Mustafa Erinç','Bayram','2026-01-31','SA'),
  ('Mustafa Erinç','Bayram','2026-02-07','SA'),

  -- ========================================
  -- 9) Hüseyin Enes Yaman (18 kayıt)
  -- ========================================
  ('Hüseyin Enes','Yaman','2025-09-20','45'),
  ('Hüseyin Enes','Yaman','2025-09-27','90'),
  ('Hüseyin Enes','Yaman','2025-10-04','85'),
  ('Hüseyin Enes','Yaman','2025-10-11','90'),
  ('Hüseyin Enes','Yaman','2025-10-18','90'),
  ('Hüseyin Enes','Yaman','2025-10-25','90'),
  ('Hüseyin Enes','Yaman','2025-11-01','55'),
  ('Hüseyin Enes','Yaman','2025-11-08','30'),
  ('Hüseyin Enes','Yaman','2025-11-15','55'),
  ('Hüseyin Enes','Yaman','2025-11-22','85'),
  ('Hüseyin Enes','Yaman','2025-11-29','70'),
  ('Hüseyin Enes','Yaman','2025-12-06','65'),
  ('Hüseyin Enes','Yaman','2025-12-13','SA'),
  ('Hüseyin Enes','Yaman','2026-01-10','SA'),
  ('Hüseyin Enes','Yaman','2026-01-17','SA'),
  ('Hüseyin Enes','Yaman','2026-01-24','SA'),
  ('Hüseyin Enes','Yaman','2026-01-31','SA'),
  ('Hüseyin Enes','Yaman','2026-02-07','SA'),

  -- ========================================
  -- 10) Metehan Meydan (18 kayıt)
  -- ========================================
  ('Metehan','Meydan','2025-09-20','45'),
  ('Metehan','Meydan','2025-09-27','SA'),
  ('Metehan','Meydan','2025-10-04','5'),
  ('Metehan','Meydan','2025-10-11','SA'),
  ('Metehan','Meydan','2025-10-18','SA'),
  ('Metehan','Meydan','2025-10-25','SA'),
  ('Metehan','Meydan','2025-11-01','SA'),
  ('Metehan','Meydan','2025-11-08','SA'),
  ('Metehan','Meydan','2025-11-15','10'),
  ('Metehan','Meydan','2025-11-22','5'),
  ('Metehan','Meydan','2025-11-29','SA'),
  ('Metehan','Meydan','2025-12-06','5'),
  ('Metehan','Meydan','2025-12-13','SA'),
  ('Metehan','Meydan','2026-01-10','SA'),
  ('Metehan','Meydan','2026-01-17','SA'),
  ('Metehan','Meydan','2026-01-24','SA'),
  ('Metehan','Meydan','2026-01-31','SA'),
  ('Metehan','Meydan','2026-02-07','SA'),

  -- ========================================
  -- 11) Onur Kaygusuz (12 kayıt – W13-W18 kadroda yok)
  -- ========================================
  ('Onur','Kaygusuz','2025-09-20','45'),
  ('Onur','Kaygusuz','2025-09-27','SA'),
  ('Onur','Kaygusuz','2025-10-04','SA'),
  ('Onur','Kaygusuz','2025-10-11','45'),
  ('Onur','Kaygusuz','2025-10-18','65'),
  ('Onur','Kaygusuz','2025-10-25','65'),
  ('Onur','Kaygusuz','2025-11-01','75'),
  ('Onur','Kaygusuz','2025-11-08','80'),
  ('Onur','Kaygusuz','2025-11-15','75'),
  ('Onur','Kaygusuz','2025-11-22','60'),
  ('Onur','Kaygusuz','2025-11-29','45'),
  ('Onur','Kaygusuz','2025-12-06','65'),

  -- ========================================
  -- 12) Mohamed Alwjali / Gabi (17 kayıt – W13 kadroda yok)
  -- ========================================
  ('Mohamed','Alwjali','2025-09-20','60'),
  ('Mohamed','Alwjali','2025-09-27','65'),
  ('Mohamed','Alwjali','2025-10-04','65'),
  ('Mohamed','Alwjali','2025-10-11','45'),
  ('Mohamed','Alwjali','2025-10-18','30'),
  ('Mohamed','Alwjali','2025-10-25','SAKAT'),
  ('Mohamed','Alwjali','2025-11-01','35'),
  ('Mohamed','Alwjali','2025-11-08','60'),
  ('Mohamed','Alwjali','2025-11-15','15'),
  ('Mohamed','Alwjali','2025-11-22','30'),
  ('Mohamed','Alwjali','2025-11-29','45'),
  ('Mohamed','Alwjali','2025-12-06','45'),
  -- W13 (2025-12-13) kadroda yok
  ('Mohamed','Alwjali','2026-01-10','5'),
  ('Mohamed','Alwjali','2026-01-17','SA'),
  ('Mohamed','Alwjali','2026-01-24','SA'),
  ('Mohamed','Alwjali','2026-01-31','SA'),
  ('Mohamed','Alwjali','2026-02-07','SA'),

  -- ========================================
  -- 13) Alperen Varol (17 kayıt – W17 kadroda yok)
  -- ========================================
  ('Alperen','Varol','2025-09-20','85'),
  ('Alperen','Varol','2025-09-27','90'),
  ('Alperen','Varol','2025-10-04','90'),
  ('Alperen','Varol','2025-10-11','90'),
  ('Alperen','Varol','2025-10-18','90'),
  ('Alperen','Varol','2025-10-25','90'),
  ('Alperen','Varol','2025-11-01','90'),
  ('Alperen','Varol','2025-11-08','90'),
  ('Alperen','Varol','2025-11-15','90'),
  ('Alperen','Varol','2025-11-22','90'),
  ('Alperen','Varol','2025-11-29','90'),
  ('Alperen','Varol','2025-12-06','90'),
  ('Alperen','Varol','2025-12-13','90'),
  ('Alperen','Varol','2026-01-10','90'),
  ('Alperen','Varol','2026-01-17','90'),
  ('Alperen','Varol','2026-01-24','90'),
  -- W17 (2026-01-31) kadroda yok
  ('Alperen','Varol','2026-02-07','90'),

  -- ========================================
  -- 14) Mohammed Alsayyaf (13 kayıt – W12, W15-W18 kadroda yok)
  -- ========================================
  ('Mohammed','Alsayyaf','2025-09-20','5'),
  ('Mohammed','Alsayyaf','2025-09-27','SA'),
  ('Mohammed','Alsayyaf','2025-10-04','25'),
  ('Mohammed','Alsayyaf','2025-10-11','SA'),
  ('Mohammed','Alsayyaf','2025-10-18','25'),
  ('Mohammed','Alsayyaf','2025-10-25','15'),
  ('Mohammed','Alsayyaf','2025-11-01','15'),
  ('Mohammed','Alsayyaf','2025-11-08','10'),
  ('Mohammed','Alsayyaf','2025-11-15','10'),
  ('Mohammed','Alsayyaf','2025-11-22','SA'),
  ('Mohammed','Alsayyaf','2025-11-29','SA'),
  -- W12 (2025-12-06) kadroda yok
  ('Mohammed','Alsayyaf','2025-12-13','SA'),
  ('Mohammed','Alsayyaf','2026-01-10','SA'),

  -- ========================================
  -- 15) Kuzey Ömer Durak (5 kayıt – W1-W13 kadroda yok)
  -- ========================================
  ('Kuzey Ömer','Durak','2026-01-10','20'),
  ('Kuzey Ömer','Durak','2026-01-17','C'),
  ('Kuzey Ömer','Durak','2026-01-24','25'),
  ('Kuzey Ömer','Durak','2026-01-31','30'),
  ('Kuzey Ömer','Durak','2026-02-07','45'),

  -- ========================================
  -- 16) Ozan Keleş (10 kayıt – W1-W8 kadroda yok)
  -- ========================================
  ('Ozan','Keleş','2025-11-15','35'),
  ('Ozan','Keleş','2025-11-22','5'),
  ('Ozan','Keleş','2025-11-29','20'),
  ('Ozan','Keleş','2025-12-06','25'),
  ('Ozan','Keleş','2025-12-13','90'),
  ('Ozan','Keleş','2026-01-10','70'),
  ('Ozan','Keleş','2026-01-17','80'),
  ('Ozan','Keleş','2026-01-24','80'),
  ('Ozan','Keleş','2026-01-31','60'),
  ('Ozan','Keleş','2026-02-07','45'),

  -- ========================================
  -- 17) Yiğit Efe Tepe (18 kayıt)
  -- ========================================
  ('Yiğit Efe','Tepe','2025-09-20','45'),
  ('Yiğit Efe','Tepe','2025-09-27','60'),
  ('Yiğit Efe','Tepe','2025-10-04','25'),
  ('Yiğit Efe','Tepe','2025-10-11','20'),
  ('Yiğit Efe','Tepe','2025-10-18','65'),
  ('Yiğit Efe','Tepe','2025-10-25','25'),
  ('Yiğit Efe','Tepe','2025-11-01','25'),
  ('Yiğit Efe','Tepe','2025-11-08','45'),
  ('Yiğit Efe','Tepe','2025-11-15','55'),
  ('Yiğit Efe','Tepe','2025-11-22','15'),
  ('Yiğit Efe','Tepe','2025-11-29','45'),
  ('Yiğit Efe','Tepe','2025-12-06','35'),
  ('Yiğit Efe','Tepe','2025-12-13','30'),
  ('Yiğit Efe','Tepe','2026-01-10','65'),
  ('Yiğit Efe','Tepe','2026-01-17','60'),
  ('Yiğit Efe','Tepe','2026-01-24','65'),
  ('Yiğit Efe','Tepe','2026-01-31','45'),
  ('Yiğit Efe','Tepe','2026-02-07','25'),

  -- ========================================
  -- 18) Eren Alp Koçak (18 kayıt)
  -- ========================================
  ('Eren Alp','Koçak','2025-09-20','85'),
  ('Eren Alp','Koçak','2025-09-27','90'),
  ('Eren Alp','Koçak','2025-10-04','90'),
  ('Eren Alp','Koçak','2025-10-11','90'),
  ('Eren Alp','Koçak','2025-10-18','90'),
  ('Eren Alp','Koçak','2025-10-25','75'),
  ('Eren Alp','Koçak','2025-11-01','75'),
  ('Eren Alp','Koçak','2025-11-08','90'),
  ('Eren Alp','Koçak','2025-11-15','85'),
  ('Eren Alp','Koçak','2025-11-22','60'),
  ('Eren Alp','Koçak','2025-11-29','HASTA'),
  ('Eren Alp','Koçak','2025-12-06','85'),
  ('Eren Alp','Koçak','2025-12-13','SAKAT'),
  ('Eren Alp','Koçak','2026-01-10','25'),
  ('Eren Alp','Koçak','2026-01-17','30'),
  ('Eren Alp','Koçak','2026-01-24','90'),
  ('Eren Alp','Koçak','2026-01-31','90'),
  ('Eren Alp','Koçak','2026-02-07','65'),

  -- ========================================
  -- 19) Ömer Faruk Özkanca (18 kayıt)
  -- ========================================
  ('Ömer Faruk','Özkanca','2025-09-20','30'),
  ('Ömer Faruk','Özkanca','2025-09-27','30'),
  ('Ömer Faruk','Özkanca','2025-10-04','65'),
  ('Ömer Faruk','Özkanca','2025-10-11','90'),
  ('Ömer Faruk','Özkanca','2025-10-18','90'),
  ('Ömer Faruk','Özkanca','2025-10-25','65'),
  ('Ömer Faruk','Özkanca','2025-11-01','65'),
  ('Ömer Faruk','Özkanca','2025-11-08','C'),
  ('Ömer Faruk','Özkanca','2025-11-15','85'),
  ('Ömer Faruk','Özkanca','2025-11-22','85'),
  ('Ömer Faruk','Özkanca','2025-11-29','90'),
  ('Ömer Faruk','Özkanca','2025-12-06','90'),
  ('Ömer Faruk','Özkanca','2025-12-13','90'),
  ('Ömer Faruk','Özkanca','2026-01-10','85'),
  ('Ömer Faruk','Özkanca','2026-01-17','90'),
  ('Ömer Faruk','Özkanca','2026-01-24','KD'),
  ('Ömer Faruk','Özkanca','2026-01-31','45'),
  ('Ömer Faruk','Özkanca','2026-02-07','90'),

  -- ========================================
  -- 20) Batuhan Öncel (18 kayıt)
  -- ========================================
  ('Batuhan','Öncel','2025-09-20','90'),
  ('Batuhan','Öncel','2025-09-27','90'),
  ('Batuhan','Öncel','2025-10-04','90'),
  ('Batuhan','Öncel','2025-10-11','85'),
  ('Batuhan','Öncel','2025-10-18','C'),
  ('Batuhan','Öncel','2025-10-25','25'),
  ('Batuhan','Öncel','2025-11-01','35'),
  ('Batuhan','Öncel','2025-11-08','90'),
  ('Batuhan','Öncel','2025-11-15','30'),
  ('Batuhan','Öncel','2025-11-22','30'),
  ('Batuhan','Öncel','2025-11-29','15'),
  ('Batuhan','Öncel','2025-12-06','45'),
  ('Batuhan','Öncel','2025-12-13','85'),
  ('Batuhan','Öncel','2026-01-10','90'),
  ('Batuhan','Öncel','2026-01-17','75'),
  ('Batuhan','Öncel','2026-01-24','90'),
  ('Batuhan','Öncel','2026-01-31','60'),
  ('Batuhan','Öncel','2026-02-07','SA'),

  -- ========================================
  -- 21) Bedreddin İlkcan Eren (6 kayıt – W1-W12 kadroda yok)
  -- ========================================
  ('Bedreddin İlkcan','Eren','2025-12-13','90'),
  ('Bedreddin İlkcan','Eren','2026-01-10','90'),
  ('Bedreddin İlkcan','Eren','2026-01-17','90'),
  ('Bedreddin İlkcan','Eren','2026-01-24','90'),
  ('Bedreddin İlkcan','Eren','2026-01-31','90'),
  ('Bedreddin İlkcan','Eren','2026-02-07','90'),

  -- ========================================
  -- 22) Yusuf Kaya (6 kayıt – W1-W12 kadroda yok)
  -- ========================================
  ('Yusuf','Kaya','2025-12-13','90'),
  ('Yusuf','Kaya','2026-01-10','90'),
  ('Yusuf','Kaya','2026-01-17','90'),
  ('Yusuf','Kaya','2026-01-24','90'),
  ('Yusuf','Kaya','2026-01-31','90'),
  ('Yusuf','Kaya','2026-02-07','80'),

  -- ========================================
  -- 23) Görkem Ayvaz (1 kayıt – W1-W17 kadroda yok)
  -- ========================================
  ('Görkem','Ayvaz','2026-02-07','30');

  -- ===== İşleme =====
  FOR rec IN SELECT * FROM tmp_u17_stats
  LOOP
    -- Oyuncuyu bul (isim eşleşmesi)
    SELECT id, first_name || ' ' || last_name, jersey_number, position::text
    INTO v_player_id, v_player_name, v_jersey, v_pos
    FROM players
    WHERE first_name = rec.first_name AND last_name = rec.last_name
    LIMIT 1;

    -- Maçı bul (U17!)
    SELECT id INTO v_match_id
    FROM matches
    WHERE date = rec.match_date AND age_group = 'U17'
    LIMIT 1;

    -- Her ikisi de bulunduysa istatistiği ekle
    IF v_player_id IS NOT NULL AND v_match_id IS NOT NULL THEN

      -- Değeri yorumla
      -- U17: SA = yedek (oynamadı), SAKAT/HASTA = sakat, C/KD = cezalı
      IF rec.stat_value = 'SA' THEN
        v_minutes := 0;
        v_status := NULL;          -- yedek / saha dışı
      ELSIF rec.stat_value IN ('SAKAT', 'HASTA') THEN
        v_minutes := 0;
        v_status := 'sakat';
      ELSIF rec.stat_value IN ('C', 'KD') THEN
        v_minutes := 0;
        v_status := 'cezali';
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

  RAISE NOTICE 'U17 oyuncu maç istatistikleri eklendi (23 oyuncu, 18 hafta).';
END $$;
