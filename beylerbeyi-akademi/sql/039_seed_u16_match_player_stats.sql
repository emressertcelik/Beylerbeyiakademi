-- =============================================
-- Migration: 039_seed_u16_match_player_stats.sql
-- Beylerbeyi Akademi – U16 Oyuncu Maç İstatistikleri (2025-2026 Sezonu)
-- Hafta 1-18 (Tüm Sezon)
-- SA = Yedek (oynamadı), KY = Kadroda yok (eklenmez)
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

  -- 1) Eksik oyuncuyu ekle: Pamir Kayador (030'da yok)
  IF NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Pamir' AND last_name = 'Kayador') THEN
    INSERT INTO players (first_name, last_name, birth_date, age_group, position, foot, jersey_number, seasons)
    VALUES ('Pamir', 'Kayador', '2010-01-01', 'U16', 'Bilinmiyor', 'Bilinmiyor', 99, '{"2025-2026"}');
  END IF;

  -- 2) Geçici tablo: ham veri
  CREATE TEMP TABLE tmp_u16_stats (
    first_name text,
    last_name text,
    match_date date,
    stat_value text
  ) ON COMMIT DROP;

  INSERT INTO tmp_u16_stats (first_name, last_name, match_date, stat_value) VALUES

  -- ========================================
  -- 1) Vedat Efe Ercan (16 kayıt – W15, W16 KY)
  -- ========================================
  ('Vedat Efe','Ercan','2025-09-20','68'),
  ('Vedat Efe','Ercan','2025-09-27','83'),
  ('Vedat Efe','Ercan','2025-10-04','90'),
  ('Vedat Efe','Ercan','2025-10-11','90'),
  ('Vedat Efe','Ercan','2025-10-18','90'),
  ('Vedat Efe','Ercan','2025-10-25','90'),
  ('Vedat Efe','Ercan','2025-11-01','90'),
  ('Vedat Efe','Ercan','2025-11-08','90'),
  ('Vedat Efe','Ercan','2025-11-15','85'),
  ('Vedat Efe','Ercan','2025-11-22','90'),
  ('Vedat Efe','Ercan','2025-11-29','90'),
  ('Vedat Efe','Ercan','2025-12-06','70'),
  ('Vedat Efe','Ercan','2025-12-13','90'),
  ('Vedat Efe','Ercan','2026-01-10','40'),
  -- W15 (2026-01-17) KY
  -- W16 (2026-01-24) KY
  ('Vedat Efe','Ercan','2026-01-31','SA'),
  ('Vedat Efe','Ercan','2026-02-07','90'),

  -- ========================================
  -- 2) Eymen Kuzu (13 kayıt – W14-W18 KY)
  -- ========================================
  ('Eymen','Kuzu','2025-09-20','20'),
  ('Eymen','Kuzu','2025-09-27','20'),
  ('Eymen','Kuzu','2025-10-04','SA'),
  ('Eymen','Kuzu','2025-10-11','SA'),
  ('Eymen','Kuzu','2025-10-18','SA'),
  ('Eymen','Kuzu','2025-10-25','SA'),
  ('Eymen','Kuzu','2025-11-01','SA'),
  ('Eymen','Kuzu','2025-11-08','5'),
  ('Eymen','Kuzu','2025-11-15','SA'),
  ('Eymen','Kuzu','2025-11-22','SA'),
  ('Eymen','Kuzu','2025-11-29','20'),
  ('Eymen','Kuzu','2025-12-06','SA'),
  ('Eymen','Kuzu','2025-12-13','55'),

  -- ========================================
  -- 3) Yusuf Kaya (11 kayıt – W12-W18 KY)
  -- ========================================
  ('Yusuf','Kaya','2025-09-20','90'),
  ('Yusuf','Kaya','2025-09-27','90'),
  ('Yusuf','Kaya','2025-10-04','90'),
  ('Yusuf','Kaya','2025-10-11','90'),
  ('Yusuf','Kaya','2025-10-18','70'),
  ('Yusuf','Kaya','2025-10-25','90'),
  ('Yusuf','Kaya','2025-11-01','90'),
  ('Yusuf','Kaya','2025-11-08','70'),
  ('Yusuf','Kaya','2025-11-15','90'),
  ('Yusuf','Kaya','2025-11-22','68'),
  ('Yusuf','Kaya','2025-11-29','45'),

  -- ========================================
  -- 4) Güney Kakiz (13 kayıt – W8-W12 KY)
  -- ========================================
  ('Güney','Kakiz','2025-09-20','90'),
  ('Güney','Kakiz','2025-09-27','70'),
  ('Güney','Kakiz','2025-10-04','90'),
  ('Güney','Kakiz','2025-10-11','90'),
  ('Güney','Kakiz','2025-10-18','28'),
  ('Güney','Kakiz','2025-10-25','45'),
  ('Güney','Kakiz','2025-11-01','45'),
  -- W8-W12 KY
  ('Güney','Kakiz','2025-12-13','20'),
  ('Güney','Kakiz','2026-01-10','90'),
  ('Güney','Kakiz','2026-01-17','90'),
  ('Güney','Kakiz','2026-01-24','SA'),
  ('Güney','Kakiz','2026-01-31','SA'),
  ('Güney','Kakiz','2026-02-07','SA'),

  -- ========================================
  -- 5) Mehmet Kuranç (18 kayıt – KY yok)
  -- ========================================
  ('Mehmet','Kuranç','2025-09-20','60'),
  ('Mehmet','Kuranç','2025-09-27','61'),
  ('Mehmet','Kuranç','2025-10-04','71'),
  ('Mehmet','Kuranç','2025-10-11','90'),
  ('Mehmet','Kuranç','2025-10-18','90'),
  ('Mehmet','Kuranç','2025-10-25','80'),
  ('Mehmet','Kuranç','2025-11-01','90'),
  ('Mehmet','Kuranç','2025-11-08','SA'),
  ('Mehmet','Kuranç','2025-11-15','SA'),
  ('Mehmet','Kuranç','2025-11-22','SA'),
  ('Mehmet','Kuranç','2025-11-29','SA'),
  ('Mehmet','Kuranç','2025-12-06','SA'),
  ('Mehmet','Kuranç','2025-12-13','SA'),
  ('Mehmet','Kuranç','2026-01-10','SA'),
  ('Mehmet','Kuranç','2026-01-17','SA'),
  ('Mehmet','Kuranç','2026-01-24','30'),
  ('Mehmet','Kuranç','2026-01-31','10'),
  ('Mehmet','Kuranç','2026-02-07','85'),

  -- ========================================
  -- 6) Yusuf Boran Aydınlık (7 kayıt – W1-W11 KY)
  -- ========================================
  ('Yusuf Boran','Aydınlık','2025-12-06','45'),
  ('Yusuf Boran','Aydınlık','2025-12-13','90'),
  ('Yusuf Boran','Aydınlık','2026-01-10','55'),
  ('Yusuf Boran','Aydınlık','2026-01-17','SA'),
  ('Yusuf Boran','Aydınlık','2026-01-24','10'),
  ('Yusuf Boran','Aydınlık','2026-01-31','25'),
  ('Yusuf Boran','Aydınlık','2026-02-07','20'),

  -- ========================================
  -- 7) Hakan Yusuf Özdemirci (3 kayıt – W4-W18 KY)
  -- ========================================
  ('Hakan Yusuf','Özdemirci','2025-09-20','SA'),
  ('Hakan Yusuf','Özdemirci','2025-09-27','SA'),
  ('Hakan Yusuf','Özdemirci','2025-10-04','SA'),

  -- ========================================
  -- 8) Mert Ali Günay (18 kayıt – KY yok)
  -- ========================================
  ('Mert Ali','Günay','2025-09-20','63'),
  ('Mert Ali','Günay','2025-09-27','46'),
  ('Mert Ali','Günay','2025-10-04','90'),
  ('Mert Ali','Günay','2025-10-11','40'),
  ('Mert Ali','Günay','2025-10-18','90'),
  ('Mert Ali','Günay','2025-10-25','90'),
  ('Mert Ali','Günay','2025-11-01','90'),
  ('Mert Ali','Günay','2025-11-08','90'),
  ('Mert Ali','Günay','2025-11-15','90'),
  ('Mert Ali','Günay','2025-11-22','90'),
  ('Mert Ali','Günay','2025-11-29','60'),
  ('Mert Ali','Günay','2025-12-06','90'),
  ('Mert Ali','Günay','2025-12-13','90'),
  ('Mert Ali','Günay','2026-01-10','70'),
  ('Mert Ali','Günay','2026-01-17','80'),
  ('Mert Ali','Günay','2026-01-24','65'),
  ('Mert Ali','Günay','2026-01-31','90'),
  ('Mert Ali','Günay','2026-02-07','90'),

  -- ========================================
  -- 9) Faisal Alp Mihdavi (10 kayıt – W1-W8 KY)
  -- ========================================
  ('Faisal Alp','Mihdavi','2025-11-15','45'),
  ('Faisal Alp','Mihdavi','2025-11-22','45'),
  ('Faisal Alp','Mihdavi','2025-11-29','20'),
  ('Faisal Alp','Mihdavi','2025-12-06','SA'),
  ('Faisal Alp','Mihdavi','2025-12-13','SA'),
  ('Faisal Alp','Mihdavi','2026-01-10','SA'),
  ('Faisal Alp','Mihdavi','2026-01-17','SA'),
  ('Faisal Alp','Mihdavi','2026-01-24','SA'),
  ('Faisal Alp','Mihdavi','2026-01-31','SA'),
  ('Faisal Alp','Mihdavi','2026-02-07','90'),

  -- ========================================
  -- 10) Pamir Kayador (5 kayıt – W1-W6, W12-W18 KY)
  -- ========================================
  ('Pamir','Kayador','2025-11-01','45'),
  ('Pamir','Kayador','2025-11-08','65'),
  ('Pamir','Kayador','2025-11-15','90'),
  ('Pamir','Kayador','2025-11-22','20'),
  ('Pamir','Kayador','2025-11-29','70'),

  -- ========================================
  -- 11) Hasan Kerem Turan (17 kayıt – W14 KY)
  -- ========================================
  ('Hasan Kerem','Turan','2025-09-20','45'),
  ('Hasan Kerem','Turan','2025-09-27','45'),
  ('Hasan Kerem','Turan','2025-10-04','81'),
  ('Hasan Kerem','Turan','2025-10-11','45'),
  ('Hasan Kerem','Turan','2025-10-18','78'),
  ('Hasan Kerem','Turan','2025-10-25','66'),
  ('Hasan Kerem','Turan','2025-11-01','25'),
  ('Hasan Kerem','Turan','2025-11-08','35'),
  ('Hasan Kerem','Turan','2025-11-15','45'),
  ('Hasan Kerem','Turan','2025-11-22','20'),
  ('Hasan Kerem','Turan','2025-11-29','60'),
  ('Hasan Kerem','Turan','2025-12-06','SA'),
  ('Hasan Kerem','Turan','2025-12-13','90'),
  -- W14 (2026-01-10) KY
  ('Hasan Kerem','Turan','2026-01-17','65'),
  ('Hasan Kerem','Turan','2026-01-24','90'),
  ('Hasan Kerem','Turan','2026-01-31','90'),
  ('Hasan Kerem','Turan','2026-02-07','2'),

  -- ========================================
  -- 12) Bedreddin İlkcan Eren (11 kayıt – W12-W18 KY)
  -- ========================================
  ('Bedreddin İlkcan','Eren','2025-09-20','68'),
  ('Bedreddin İlkcan','Eren','2025-09-27','90'),
  ('Bedreddin İlkcan','Eren','2025-10-04','90'),
  ('Bedreddin İlkcan','Eren','2025-10-11','85'),
  ('Bedreddin İlkcan','Eren','2025-10-18','90'),
  ('Bedreddin İlkcan','Eren','2025-10-25','90'),
  ('Bedreddin İlkcan','Eren','2025-11-01','90'),
  ('Bedreddin İlkcan','Eren','2025-11-08','90'),
  ('Bedreddin İlkcan','Eren','2025-11-15','90'),
  ('Bedreddin İlkcan','Eren','2025-11-22','90'),
  ('Bedreddin İlkcan','Eren','2025-11-29','30'),

  -- ========================================
  -- 13) Dmytro Mandazhy (11 kayıt – W12-W18 KY)
  -- ========================================
  ('Dmytro','Mandazhy','2025-09-20','45'),
  ('Dmytro','Mandazhy','2025-09-27','45'),
  ('Dmytro','Mandazhy','2025-10-04','SA'),
  ('Dmytro','Mandazhy','2025-10-11','67'),
  ('Dmytro','Mandazhy','2025-10-18','SA'),
  ('Dmytro','Mandazhy','2025-10-25','24'),
  ('Dmytro','Mandazhy','2025-11-01','45'),
  ('Dmytro','Mandazhy','2025-11-08','55'),
  ('Dmytro','Mandazhy','2025-11-15','SA'),
  ('Dmytro','Mandazhy','2025-11-22','5'),
  ('Dmytro','Mandazhy','2025-11-29','SA'),

  -- ========================================
  -- 14) Abdul Batın Kaçar (18 kayıt – KY yok)
  -- ========================================
  ('Abdul Batın','Kaçar','2025-09-20','90'),
  ('Abdul Batın','Kaçar','2025-09-27','90'),
  ('Abdul Batın','Kaçar','2025-10-04','90'),
  ('Abdul Batın','Kaçar','2025-10-11','90'),
  ('Abdul Batın','Kaçar','2025-10-18','90'),
  ('Abdul Batın','Kaçar','2025-10-25','85'),
  ('Abdul Batın','Kaçar','2025-11-01','90'),
  ('Abdul Batın','Kaçar','2025-11-08','85'),
  ('Abdul Batın','Kaçar','2025-11-15','90'),
  ('Abdul Batın','Kaçar','2025-11-22','70'),
  ('Abdul Batın','Kaçar','2025-11-29','SA'),
  ('Abdul Batın','Kaçar','2025-12-06','90'),
  ('Abdul Batın','Kaçar','2025-12-13','90'),
  ('Abdul Batın','Kaçar','2026-01-10','90'),
  ('Abdul Batın','Kaçar','2026-01-17','90'),
  ('Abdul Batın','Kaçar','2026-01-24','90'),
  ('Abdul Batın','Kaçar','2026-01-31','90'),
  ('Abdul Batın','Kaçar','2026-02-07','90'),

  -- ========================================
  -- 15) Selçuk Arslanbayrak (12 kayıt – W13-W18 KY)
  -- ========================================
  ('Selçuk','Arslanbayrak','2025-09-20','63'),
  ('Selçuk','Arslanbayrak','2025-09-27','61'),
  ('Selçuk','Arslanbayrak','2025-10-04','SA'),
  ('Selçuk','Arslanbayrak','2025-10-11','SA'),
  ('Selçuk','Arslanbayrak','2025-10-18','SA'),
  ('Selçuk','Arslanbayrak','2025-10-25','10'),
  ('Selçuk','Arslanbayrak','2025-11-01','SA'),
  ('Selçuk','Arslanbayrak','2025-11-08','SA'),
  ('Selçuk','Arslanbayrak','2025-11-15','45'),
  ('Selçuk','Arslanbayrak','2025-11-22','SA'),
  ('Selçuk','Arslanbayrak','2025-11-29','SA'),
  ('Selçuk','Arslanbayrak','2025-12-06','SA'),

  -- ========================================
  -- 16) Rohat Berk Bilaloğlu (9 kayıt – W8-W9, W12-W18 KY)
  -- ========================================
  ('Rohat Berk','Bilaloğlu','2025-09-20','45'),
  ('Rohat Berk','Bilaloğlu','2025-09-27','61'),
  ('Rohat Berk','Bilaloğlu','2025-10-04','19'),
  ('Rohat Berk','Bilaloğlu','2025-10-11','40'),
  ('Rohat Berk','Bilaloğlu','2025-10-18','45'),
  ('Rohat Berk','Bilaloğlu','2025-10-25','SA'),
  ('Rohat Berk','Bilaloğlu','2025-11-01','SA'),
  ('Rohat Berk','Bilaloğlu','2025-11-22','SA'),
  ('Rohat Berk','Bilaloğlu','2025-11-29','45'),

  -- ========================================
  -- 17) Yağız Akarsu (17 kayıt – W11 KY)
  -- ========================================
  ('Yağız','Akarsu','2025-09-20','45'),
  ('Yağız','Akarsu','2025-09-27','45'),
  ('Yağız','Akarsu','2025-10-04','71'),
  ('Yağız','Akarsu','2025-10-11','40'),
  ('Yağız','Akarsu','2025-10-18','62'),
  ('Yağız','Akarsu','2025-10-25','90'),
  ('Yağız','Akarsu','2025-11-01','85'),
  ('Yağız','Akarsu','2025-11-08','75'),
  ('Yağız','Akarsu','2025-11-15','70'),
  ('Yağız','Akarsu','2025-11-22','80'),
  -- W11 (2025-11-29) KY
  ('Yağız','Akarsu','2025-12-06','70'),
  ('Yağız','Akarsu','2025-12-13','45'),
  ('Yağız','Akarsu','2026-01-10','90'),
  ('Yağız','Akarsu','2026-01-17','70'),
  ('Yağız','Akarsu','2026-01-24','65'),
  ('Yağız','Akarsu','2026-01-31','75'),
  ('Yağız','Akarsu','2026-02-07','75'),

  -- ========================================
  -- 18) Burak Sevindik (18 kayıt – KY yok)
  -- ========================================
  ('Burak','Sevindik','2025-09-20','63'),
  ('Burak','Sevindik','2025-09-27','61'),
  ('Burak','Sevindik','2025-10-04','90'),
  ('Burak','Sevindik','2025-10-11','67'),
  ('Burak','Sevindik','2025-10-18','45'),
  ('Burak','Sevindik','2025-10-25','45'),
  ('Burak','Sevindik','2025-11-01','25'),
  ('Burak','Sevindik','2025-11-08','15'),
  ('Burak','Sevindik','2025-11-15','45'),
  ('Burak','Sevindik','2025-11-22','20'),
  ('Burak','Sevindik','2025-11-29','70'),
  ('Burak','Sevindik','2025-12-06','60'),
  ('Burak','Sevindik','2025-12-13','85'),
  ('Burak','Sevindik','2026-01-10','85'),
  ('Burak','Sevindik','2026-01-17','90'),
  ('Burak','Sevindik','2026-01-24','80'),
  ('Burak','Sevindik','2026-01-31','65'),
  ('Burak','Sevindik','2026-02-07','SA'),

  -- ========================================
  -- 19) Utku Uysal (18 kayıt – KY yok)
  -- ========================================
  ('Utku','Uysal','2025-09-20','27'),
  ('Utku','Uysal','2025-09-27','45'),
  ('Utku','Uysal','2025-10-04','9'),
  ('Utku','Uysal','2025-10-11','5'),
  ('Utku','Uysal','2025-10-18','SA'),
  ('Utku','Uysal','2025-10-25','45'),
  ('Utku','Uysal','2025-11-01','65'),
  ('Utku','Uysal','2025-11-08','55'),
  ('Utku','Uysal','2025-11-15','45'),
  ('Utku','Uysal','2025-11-22','90'),
  ('Utku','Uysal','2025-11-29','85'),
  ('Utku','Uysal','2025-12-06','90'),
  ('Utku','Uysal','2025-12-13','90'),
  ('Utku','Uysal','2026-01-10','90'),
  ('Utku','Uysal','2026-01-17','90'),
  ('Utku','Uysal','2026-01-24','20'),
  ('Utku','Uysal','2026-01-31','25'),
  ('Utku','Uysal','2026-02-07','SA'),

  -- ========================================
  -- 20) Poyraz Soğancıoğlu (18 kayıt – KY yok)
  -- ========================================
  ('Poyraz','Soğancıoğlu','2025-09-20','90'),
  ('Poyraz','Soğancıoğlu','2025-09-27','90'),
  ('Poyraz','Soğancıoğlu','2025-10-04','90'),
  ('Poyraz','Soğancıoğlu','2025-10-11','90'),
  ('Poyraz','Soğancıoğlu','2025-10-18','90'),
  ('Poyraz','Soğancıoğlu','2025-10-25','90'),
  ('Poyraz','Soğancıoğlu','2025-11-01','90'),
  ('Poyraz','Soğancıoğlu','2025-11-08','90'),
  ('Poyraz','Soğancıoğlu','2025-11-15','SA'),
  ('Poyraz','Soğancıoğlu','2025-11-22','20'),
  ('Poyraz','Soğancıoğlu','2025-11-29','SA'),
  ('Poyraz','Soğancıoğlu','2025-12-06','30'),
  ('Poyraz','Soğancıoğlu','2025-12-13','25'),
  ('Poyraz','Soğancıoğlu','2026-01-10','90'),
  ('Poyraz','Soğancıoğlu','2026-01-17','90'),
  ('Poyraz','Soğancıoğlu','2026-01-24','90'),
  ('Poyraz','Soğancıoğlu','2026-01-31','90'),
  ('Poyraz','Soğancıoğlu','2026-02-07','90'),

  -- ========================================
  -- 21) Muhammed Hamza Seyyar (1 kayıt – W5=SA, geri kalan KY)
  -- ========================================
  ('Muhammed Hamza','Seyyar','2025-10-18','SA'),

  -- ========================================
  -- 22) Sinan Ercan Fidan (11 kayıt – W1-W7 KY)
  -- ========================================
  ('Sinan Ercan','Fidan','2025-11-08','5'),
  ('Sinan Ercan','Fidan','2025-11-15','SA'),
  ('Sinan Ercan','Fidan','2025-11-22','20'),
  ('Sinan Ercan','Fidan','2025-11-29','32'),
  ('Sinan Ercan','Fidan','2025-12-06','20'),
  ('Sinan Ercan','Fidan','2025-12-13','45'),
  ('Sinan Ercan','Fidan','2026-01-10','20'),
  ('Sinan Ercan','Fidan','2026-01-17','35'),
  ('Sinan Ercan','Fidan','2026-01-24','SA'),
  ('Sinan Ercan','Fidan','2026-01-31','SA'),
  ('Sinan Ercan','Fidan','2026-02-07','10'),

  -- ========================================
  -- 23) Kadir Eymen Dağlı (10 kayıt – W1-W7, W14 KY)
  -- ========================================
  ('Kadir Eymen','Dağlı','2025-11-08','10'),
  ('Kadir Eymen','Dağlı','2025-11-15','35'),
  ('Kadir Eymen','Dağlı','2025-11-22','SA'),
  ('Kadir Eymen','Dağlı','2025-11-29','10'),
  ('Kadir Eymen','Dağlı','2025-12-06','SA'),
  ('Kadir Eymen','Dağlı','2025-12-13','30'),
  -- W14 (2026-01-10) KY
  ('Kadir Eymen','Dağlı','2026-01-17','SA'),
  ('Kadir Eymen','Dağlı','2026-01-24','SA'),
  ('Kadir Eymen','Dağlı','2026-01-31','SA'),
  ('Kadir Eymen','Dağlı','2026-02-07','SA'),

  -- ========================================
  -- 24) Fatih Ölmez (11 kayıt – W1-W7 KY)
  -- ========================================
  ('Fatih','Ölmez','2025-11-08','90'),
  ('Fatih','Ölmez','2025-11-15','90'),
  ('Fatih','Ölmez','2025-11-22','90'),
  ('Fatih','Ölmez','2025-11-29','45'),
  ('Fatih','Ölmez','2025-12-06','70'),
  ('Fatih','Ölmez','2025-12-13','90'),
  ('Fatih','Ölmez','2026-01-10','90'),
  ('Fatih','Ölmez','2026-01-17','90'),
  ('Fatih','Ölmez','2026-01-24','65'),
  ('Fatih','Ölmez','2026-01-31','80'),
  ('Fatih','Ölmez','2026-02-07','80'),

  -- ========================================
  -- 25) Alperen Taş (8 kayıt – W1-W10 KY)
  -- ========================================
  ('Alperen','Taş','2025-11-29','45'),
  ('Alperen','Taş','2025-12-06','70'),
  ('Alperen','Taş','2025-12-13','45'),
  ('Alperen','Taş','2026-01-10','90'),
  ('Alperen','Taş','2026-01-17','90'),
  ('Alperen','Taş','2026-01-24','60'),
  ('Alperen','Taş','2026-01-31','90'),
  ('Alperen','Taş','2026-02-07','65'),

  -- ========================================
  -- 26) Ahmet Kayra Okçuoğlu (6 kayıt – W1-W12 KY)
  -- ========================================
  ('Ahmet Kayra','Okçuoğlu','2025-12-13','45'),
  ('Ahmet Kayra','Okçuoğlu','2026-01-10','30'),
  ('Ahmet Kayra','Okçuoğlu','2026-01-17','5'),
  ('Ahmet Kayra','Okçuoğlu','2026-01-24','45'),
  ('Ahmet Kayra','Okçuoğlu','2026-01-31','20'),
  ('Ahmet Kayra','Okçuoğlu','2026-02-07','10');

  -- ===== İşleme =====
  FOR rec IN SELECT * FROM tmp_u16_stats
  LOOP
    -- Oyuncuyu bul (U16 öncelikli)
    SELECT id, first_name || ' ' || last_name, jersey_number, position::text
    INTO v_player_id, v_player_name, v_jersey, v_pos
    FROM players
    WHERE first_name = rec.first_name AND last_name = rec.last_name
    ORDER BY CASE WHEN age_group = 'U16' THEN 0 ELSE 1 END
    LIMIT 1;

    -- Maçı bul (U16!)
    SELECT id INTO v_match_id
    FROM matches
    WHERE date = rec.match_date AND age_group = 'U16'
    LIMIT 1;

    -- Her ikisi de bulunduysa istatistiği ekle
    IF v_player_id IS NOT NULL AND v_match_id IS NOT NULL THEN

      -- Değeri yorumla
      IF rec.stat_value = 'SA' THEN
        v_minutes := 0;
        v_status := NULL;          -- yedek / oynamadı
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

  RAISE NOTICE 'U16 oyuncu maç istatistikleri eklendi (26 oyuncu, 18 hafta).';
END $$;
