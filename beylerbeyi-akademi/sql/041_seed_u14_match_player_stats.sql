-- =============================================
-- Migration: 041_seed_u14_match_player_stats.sql
-- Beylerbeyi Akademi – U14 Oyuncu Maç İstatistikleri (2025-2026 Sezonu)
-- Hafta 1-20 (Oynanan maçlar)
-- SA = Yedek (oynamadı), C = Cezalı, KY = Kadroda yok (eklenmez)
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
  CREATE TEMP TABLE tmp_u14_stats (
    first_name text,
    last_name text,
    match_date date,
    stat_value text
  ) ON COMMIT DROP;

  INSERT INTO tmp_u14_stats (first_name, last_name, match_date, stat_value) VALUES

  -- ========================================
  -- 1) Ege Burak Sönmez (20 kayıt – her maçta 40dk)
  -- ========================================
  ('Ege Burak','Sönmez','2025-09-13','40'),
  ('Ege Burak','Sönmez','2025-09-21','40'),
  ('Ege Burak','Sönmez','2025-09-28','40'),
  ('Ege Burak','Sönmez','2025-10-05','40'),
  ('Ege Burak','Sönmez','2025-10-12','40'),
  ('Ege Burak','Sönmez','2025-10-19','40'),
  ('Ege Burak','Sönmez','2025-10-26','40'),
  ('Ege Burak','Sönmez','2025-11-02','40'),
  ('Ege Burak','Sönmez','2025-11-09','40'),
  ('Ege Burak','Sönmez','2025-11-16','40'),
  ('Ege Burak','Sönmez','2025-11-23','40'),
  ('Ege Burak','Sönmez','2025-11-30','40'),
  ('Ege Burak','Sönmez','2025-12-07','40'),
  ('Ege Burak','Sönmez','2025-12-21','40'),
  ('Ege Burak','Sönmez','2025-12-28','40'),
  ('Ege Burak','Sönmez','2026-01-03','40'),
  ('Ege Burak','Sönmez','2026-01-10','40'),
  ('Ege Burak','Sönmez','2026-01-17','40'),
  ('Ege Burak','Sönmez','2026-01-24','40'),
  ('Ege Burak','Sönmez','2026-02-01','40'),

  -- ========================================
  -- 2) Ali Mert Zengin (W1-W12: 40dk, W13: SA, W14-W20: KY)
  -- ========================================
  ('Ali Mert','Zengin','2025-09-13','40'),
  ('Ali Mert','Zengin','2025-09-21','40'),
  ('Ali Mert','Zengin','2025-09-28','40'),
  ('Ali Mert','Zengin','2025-10-05','40'),
  ('Ali Mert','Zengin','2025-10-12','SA'),
  ('Ali Mert','Zengin','2025-10-19','40'),
  ('Ali Mert','Zengin','2025-10-26','40'),
  ('Ali Mert','Zengin','2025-11-02','40'),
  ('Ali Mert','Zengin','2025-11-09','SA'),
  ('Ali Mert','Zengin','2025-11-16','SA'),
  ('Ali Mert','Zengin','2025-11-23','SA'),
  ('Ali Mert','Zengin','2025-11-30','SA'),
  ('Ali Mert','Zengin','2025-12-07','SA'),
  -- W14-W20: KY

  -- ========================================
  -- 3) Hamza Kızılboğa (KY tüm maçlarda, sadece W10: 40, W11: 40, W12: 40, W13: 40)
  -- W1-W4: KY, W5: SA, W6-W7: SA, W8-W9: SA, W14-W20: KY
  -- ========================================
  ('Hamza','Kızılboğa','2025-10-12','SA'),
  ('Hamza','Kızılboğa','2025-10-19','SA'),
  ('Hamza','Kızılboğa','2025-10-26','SA'),
  ('Hamza','Kızılboğa','2025-11-02','SA'),
  ('Hamza','Kızılboğa','2025-11-09','SA'),
  ('Hamza','Kızılboğa','2025-11-16','40'),
  ('Hamza','Kızılboğa','2025-11-23','40'),
  ('Hamza','Kızılboğa','2025-11-30','40'),
  ('Hamza','Kızılboğa','2025-12-07','40'),

  -- ========================================
  -- 4) Bertuğ Erdoğan Başoğlu (20 kayıt)
  -- ========================================
  ('Bertuğ Erdoğan','Başoğlu','2025-09-13','20'),
  ('Bertuğ Erdoğan','Başoğlu','2025-09-21','58'),
  ('Bertuğ Erdoğan','Başoğlu','2025-09-28','67'),
  ('Bertuğ Erdoğan','Başoğlu','2025-10-05','40'),
  ('Bertuğ Erdoğan','Başoğlu','2025-10-12','70'),
  ('Bertuğ Erdoğan','Başoğlu','2025-10-19','40'),
  ('Bertuğ Erdoğan','Başoğlu','2025-10-26','80'),
  ('Bertuğ Erdoğan','Başoğlu','2025-11-02','80'),
  ('Bertuğ Erdoğan','Başoğlu','2025-11-09','60'),
  ('Bertuğ Erdoğan','Başoğlu','2025-11-16','57'),
  ('Bertuğ Erdoğan','Başoğlu','2025-11-23','60'),
  ('Bertuğ Erdoğan','Başoğlu','2025-11-30','15'),
  ('Bertuğ Erdoğan','Başoğlu','2025-12-07','20'),
  -- W14-W20: KY (boş hücreler)

  -- ========================================
  -- 5) Mehmet Akif Erdal (bazı haftalarda KY)
  -- ========================================
  ('Mehmet Akif','Erdal','2025-10-12','10'),
  ('Mehmet Akif','Erdal','2025-10-19','20'),
  ('Mehmet Akif','Erdal','2025-10-26','75'),
  ('Mehmet Akif','Erdal','2025-11-02','25'),

  -- ========================================
  -- 6) Ufuk Çelikten (W1-W4: KY, W5-W20)
  -- ========================================
  ('Ufuk','Çelikten','2025-10-12','80'),
  ('Ufuk','Çelikten','2025-10-19','80'),
  ('Ufuk','Çelikten','2025-10-26','80'),
  ('Ufuk','Çelikten','2025-11-02','80'),
  ('Ufuk','Çelikten','2025-11-09','SA'),
  ('Ufuk','Çelikten','2025-11-16','58'),
  ('Ufuk','Çelikten','2025-11-23','SA'),

  -- ========================================
  -- 7) Taha Mert Bayrak
  -- ========================================
  ('Taha Mert','Bayrak','2025-09-13','80'),
  ('Taha Mert','Bayrak','2025-09-21','80'),
  ('Taha Mert','Bayrak','2025-09-28','80'),
  ('Taha Mert','Bayrak','2025-10-05','80'),
  ('Taha Mert','Bayrak','2025-10-12','SA'),
  ('Taha Mert','Bayrak','2025-10-19','20'),
  ('Taha Mert','Bayrak','2025-10-26','SA'),
  ('Taha Mert','Bayrak','2025-11-02','22'),
  ('Taha Mert','Bayrak','2025-11-09','20'),
  ('Taha Mert','Bayrak','2025-11-16','23'),
  ('Taha Mert','Bayrak','2025-11-23','20'),
  ('Taha Mert','Bayrak','2025-11-30','50'),
  ('Taha Mert','Bayrak','2025-12-07','SA'),
  -- W14 onwards: KY (appears blank)

  -- ========================================
  -- 8) Utku Doruk Söylemiş
  -- ========================================
  ('Utku Doruk','Söylemiş','2025-09-13','80'),
  ('Utku Doruk','Söylemiş','2025-09-21','80'),
  ('Utku Doruk','Söylemiş','2025-09-28','80'),
  ('Utku Doruk','Söylemiş','2025-10-05','80'),
  ('Utku Doruk','Söylemiş','2025-10-12','80'),
  ('Utku Doruk','Söylemiş','2025-10-19','40'),
  ('Utku Doruk','Söylemiş','2025-10-26','65'),
  ('Utku Doruk','Söylemiş','2025-11-02','80'),
  ('Utku Doruk','Söylemiş','2025-11-16','80'),
  ('Utku Doruk','Söylemiş','2025-11-23','30'),
  ('Utku Doruk','Söylemiş','2026-01-17','80'),
  ('Utku Doruk','Söylemiş','2026-01-24','30'),
  ('Utku Doruk','Söylemiş','2026-02-01','40'),

  -- ========================================
  -- 9) Ömer Demir Tülü
  -- ========================================
  ('Ömer Demir','Tülü','2025-09-13','30'),
  ('Ömer Demir','Tülü','2025-09-21','22'),
  ('Ömer Demir','Tülü','2025-09-28','20'),
  ('Ömer Demir','Tülü','2025-10-05','40'),
  ('Ömer Demir','Tülü','2025-10-12','20'),
  ('Ömer Demir','Tülü','2025-10-19','25'),
  ('Ömer Demir','Tülü','2025-10-26','SA'),
  ('Ömer Demir','Tülü','2025-11-02','SA'),
  ('Ömer Demir','Tülü','2025-11-09','10'),
  ('Ömer Demir','Tülü','2025-11-16','SA'),
  ('Ömer Demir','Tülü','2025-11-23','10'),
  ('Ömer Demir','Tülü','2025-11-30','15'),
  ('Ömer Demir','Tülü','2025-12-07','SA'),
  ('Ömer Demir','Tülü','2025-12-21','SA'),
  ('Ömer Demir','Tülü','2025-12-28','SA'),
  ('Ömer Demir','Tülü','2026-01-03','SA'),
  ('Ömer Demir','Tülü','2026-01-10','SA'),
  ('Ömer Demir','Tülü','2026-01-17','SA'),
  ('Ömer Demir','Tülü','2026-01-24','SA'),
  ('Ömer Demir','Tülü','2026-02-01','SA'),

  -- ========================================
  -- 10) Hikmet Batın Bakırcı
  -- ========================================
  ('Hikmet Batın','Bakırcı','2025-09-21','13'),
  ('Hikmet Batın','Bakırcı','2025-09-28','10'),
  ('Hikmet Batın','Bakırcı','2025-10-12','SA'),
  ('Hikmet Batın','Bakırcı','2025-10-19','5'),
  ('Hikmet Batın','Bakırcı','2025-10-26','20'),
  ('Hikmet Batın','Bakırcı','2025-11-02','10'),
  ('Hikmet Batın','Bakırcı','2025-11-09','SA'),
  ('Hikmet Batın','Bakırcı','2025-11-16','20'),
  ('Hikmet Batın','Bakırcı','2025-11-23','30'),

  -- ========================================
  -- 11) Muhammed Bilal Başar
  -- ========================================
  ('Muhammed Bilal','Başar','2025-09-13','60'),
  ('Muhammed Bilal','Başar','2025-09-21','80'),
  ('Muhammed Bilal','Başar','2025-09-28','60'),
  ('Muhammed Bilal','Başar','2025-10-05','60'),
  ('Muhammed Bilal','Başar','2025-10-12','70'),
  ('Muhammed Bilal','Başar','2025-10-19','60'),
  ('Muhammed Bilal','Başar','2025-10-26','60'),
  ('Muhammed Bilal','Başar','2025-11-02','53'),
  ('Muhammed Bilal','Başar','2025-11-09','23'),
  ('Muhammed Bilal','Başar','2025-11-16','SA'),

  -- ========================================
  -- 12) İsmail Kurt
  -- ========================================
  ('İsmail','Kurt','2025-09-13','22'),
  ('İsmail','Kurt','2025-09-21','20'),
  ('İsmail','Kurt','2025-09-28','20'),
  ('İsmail','Kurt','2025-10-05','10'),
  ('İsmail','Kurt','2025-10-12','SA'),

  -- ========================================
  -- 13) Muhammed Emin Zorba
  -- ========================================
  ('Muhammed Emin','Zorba','2025-09-13','22'),
  ('Muhammed Emin','Zorba','2025-09-21','SA'),
  ('Muhammed Emin','Zorba','2025-10-05','80'),
  ('Muhammed Emin','Zorba','2025-10-12','70'),
  ('Muhammed Emin','Zorba','2025-10-19','SA'),
  ('Muhammed Emin','Zorba','2025-10-26','80'),
  ('Muhammed Emin','Zorba','2025-11-02','80'),
  ('Muhammed Emin','Zorba','2025-11-09','80'),
  ('Muhammed Emin','Zorba','2025-11-16','80'),
  ('Muhammed Emin','Zorba','2025-11-23','80'),
  ('Muhammed Emin','Zorba','2025-11-30','80'),
  ('Muhammed Emin','Zorba','2025-12-07','80'),
  ('Muhammed Emin','Zorba','2026-01-03','80'),
  ('Muhammed Emin','Zorba','2026-01-10','80'),
  ('Muhammed Emin','Zorba','2026-01-17','60'),
  ('Muhammed Emin','Zorba','2026-01-24','60'),

  -- ========================================
  -- 14) Taiga Güçlü Gündoğdu
  -- ========================================
  ('Taiga Güçlü','Gündoğdu','2025-09-13','80'),
  ('Taiga Güçlü','Gündoğdu','2025-09-21','60'),
  ('Taiga Güçlü','Gündoğdu','2025-09-28','80'),
  ('Taiga Güçlü','Gündoğdu','2025-10-05','80'),
  ('Taiga Güçlü','Gündoğdu','2025-10-12','80'),
  ('Taiga Güçlü','Gündoğdu','2025-10-19','80'),
  ('Taiga Güçlü','Gündoğdu','2025-10-26','65'),
  ('Taiga Güçlü','Gündoğdu','2025-11-02','58'),
  ('Taiga Güçlü','Gündoğdu','2025-11-09','60'),
  ('Taiga Güçlü','Gündoğdu','2025-11-16','22'),
  ('Taiga Güçlü','Gündoğdu','2025-11-23','SA'),
  ('Taiga Güçlü','Gündoğdu','2026-01-03','22'),
  ('Taiga Güçlü','Gündoğdu','2026-01-10','SA'),
  ('Taiga Güçlü','Gündoğdu','2026-01-17','10'),

  -- ========================================
  -- 15) Ata Berat Alyu
  -- ========================================
  ('Ata Berat','Alyu','2025-09-13','50'),
  ('Ata Berat','Alyu','2025-09-21','58'),
  ('Ata Berat','Alyu','2025-09-28','80'),
  ('Ata Berat','Alyu','2025-10-05','65'),

  -- ========================================
  -- 16) Enes Eymen Kaya
  -- ========================================
  ('Enes Eymen','Kaya','2025-10-19','60'),

  -- ========================================
  -- 17) Hamza İslamoğlu
  -- ========================================
  ('Hamza','İslamoğlu','2025-09-13','42'),
  ('Hamza','İslamoğlu','2025-09-21','22'),
  ('Hamza','İslamoğlu','2025-09-28','20'),
  ('Hamza','İslamoğlu','2025-10-05','15'),
  ('Hamza','İslamoğlu','2025-10-12','20'),
  ('Hamza','İslamoğlu','2025-10-19','25'),
  ('Hamza','İslamoğlu','2025-10-26','20'),
  ('Hamza','İslamoğlu','2025-11-02','SA'),
  ('Hamza','İslamoğlu','2025-11-09','SA'),
  ('Hamza','İslamoğlu','2025-11-16','12'),
  ('Hamza','İslamoğlu','2025-11-23','SA'),
  ('Hamza','İslamoğlu','2025-11-30','22'),
  ('Hamza','İslamoğlu','2025-12-07','20'),
  ('Hamza','İslamoğlu','2025-12-28','30'),
  ('Hamza','İslamoğlu','2026-01-03','30'),
  ('Hamza','İslamoğlu','2026-01-17','40'),

  -- ========================================
  -- 18) Ali Çopuroğlu
  -- ========================================
  ('Ali','Çopuroğlu','2025-10-19','40'),
  ('Ali','Çopuroğlu','2025-10-26','60'),
  ('Ali','Çopuroğlu','2025-11-02','65'),
  ('Ali','Çopuroğlu','2025-11-09','53'),
  ('Ali','Çopuroğlu','2025-11-16','80'),
  ('Ali','Çopuroğlu','2025-11-23','30'),
  ('Ali','Çopuroğlu','2025-11-30','32'),
  ('Ali','Çopuroğlu','2025-12-07','80'),
  ('Ali','Çopuroğlu','2025-12-21','C'),
  ('Ali','Çopuroğlu','2025-12-28','C'),
  ('Ali','Çopuroğlu','2026-01-03','C'),
  ('Ali','Çopuroğlu','2026-01-10','40'),
  ('Ali','Çopuroğlu','2026-01-17','10'),
  ('Ali','Çopuroğlu','2026-01-24','80'),

  -- ========================================
  -- 19) Mehmet Kerem Kaptan
  -- ========================================
  ('Mehmet Kerem','Kaptan','2025-09-13','60'),
  ('Mehmet Kerem','Kaptan','2025-09-21','58'),
  ('Mehmet Kerem','Kaptan','2025-09-28','80'),
  ('Mehmet Kerem','Kaptan','2025-10-05','30'),
  ('Mehmet Kerem','Kaptan','2025-10-12','60'),
  ('Mehmet Kerem','Kaptan','2025-10-19','25'),
  ('Mehmet Kerem','Kaptan','2025-10-26','60'),
  ('Mehmet Kerem','Kaptan','2025-11-02','40'),
  ('Mehmet Kerem','Kaptan','2025-11-09','15'),
  ('Mehmet Kerem','Kaptan','2025-11-16','27'),
  ('Mehmet Kerem','Kaptan','2025-11-23','20'),
  ('Mehmet Kerem','Kaptan','2025-11-30','32'),

  -- ========================================
  -- 20) Tuna Baykal
  -- ========================================
  ('Tuna','Baykal','2025-09-13','40'),
  ('Tuna','Baykal','2025-09-21','58'),
  ('Tuna','Baykal','2025-09-28','30'),
  ('Tuna','Baykal','2025-10-05','70'),
  ('Tuna','Baykal','2025-10-12','55'),
  ('Tuna','Baykal','2025-10-19','SA'),
  ('Tuna','Baykal','2025-10-26','40'),
  ('Tuna','Baykal','2025-11-02','65'),
  ('Tuna','Baykal','2025-11-09','70'),
  ('Tuna','Baykal','2025-11-16','60'),
  ('Tuna','Baykal','2025-11-23','57'),
  ('Tuna','Baykal','2025-11-30','70'),
  ('Tuna','Baykal','2025-12-07','80'),
  ('Tuna','Baykal','2025-12-21','80'),
  ('Tuna','Baykal','2025-12-28','80'),
  ('Tuna','Baykal','2026-01-03','80'),
  ('Tuna','Baykal','2026-01-10','80'),
  ('Tuna','Baykal','2026-01-17','80'),
  ('Tuna','Baykal','2026-01-24','80'),
  ('Tuna','Baykal','2026-02-01','70'),

  -- ========================================
  -- 21) Mehmet Cengizhan Kirazlı
  -- ========================================
  ('Mehmet Cengizhan','Kirazlı','2025-09-13','20'),
  ('Mehmet Cengizhan','Kirazlı','2025-09-21','22'),
  ('Mehmet Cengizhan','Kirazlı','2025-09-28','50'),
  ('Mehmet Cengizhan','Kirazlı','2025-10-05','70'),
  ('Mehmet Cengizhan','Kirazlı','2025-10-12','20'),
  ('Mehmet Cengizhan','Kirazlı','2025-10-19','55'),
  ('Mehmet Cengizhan','Kirazlı','2025-10-26','20'),
  ('Mehmet Cengizhan','Kirazlı','2025-11-02','40'),
  ('Mehmet Cengizhan','Kirazlı','2025-11-09','15'),
  ('Mehmet Cengizhan','Kirazlı','2025-11-16','22'),
  ('Mehmet Cengizhan','Kirazlı','2025-11-23','40'),
  ('Mehmet Cengizhan','Kirazlı','2025-11-30','48'),
  ('Mehmet Cengizhan','Kirazlı','2025-12-07','80'),
  ('Mehmet Cengizhan','Kirazlı','2025-12-21','58'),
  ('Mehmet Cengizhan','Kirazlı','2025-12-28','60'),
  ('Mehmet Cengizhan','Kirazlı','2026-01-03','80'),
  ('Mehmet Cengizhan','Kirazlı','2026-01-17','70'),

  -- ========================================
  -- 22) Berkay Koçhan
  -- ========================================
  ('Berkay','Koçhan','2025-09-21','80'),
  ('Berkay','Koçhan','2025-09-28','80'),
  ('Berkay','Koçhan','2025-10-05','80'),
  ('Berkay','Koçhan','2025-10-12','80'),
  ('Berkay','Koçhan','2025-10-19','80'),
  ('Berkay','Koçhan','2025-10-26','80'),
  ('Berkay','Koçhan','2025-11-02','80'),
  ('Berkay','Koçhan','2025-11-09','80'),
  ('Berkay','Koçhan','2025-11-16','80'),
  ('Berkay','Koçhan','2025-11-23','80'),

  -- ========================================
  -- 23) Görkem Evsen
  -- ========================================
  ('Görkem','Evsen','2025-09-13','60'),

  -- ========================================
  -- 24) Ahmet Berk Alkış (W13-W20 arası)
  -- ========================================
  ('Ahmet Berk','Alkış','2025-12-07','65'),
  ('Ahmet Berk','Alkış','2025-12-21','60'),
  ('Ahmet Berk','Alkış','2025-12-28','80'),
  ('Ahmet Berk','Alkış','2026-01-03','80'),
  ('Ahmet Berk','Alkış','2026-01-10','80'),

  -- ========================================
  -- 25) Çınar Yalçın (W10 sonrası)
  -- ========================================
  ('Çınar','Yalçın','2025-11-16','27'),
  ('Çınar','Yalçın','2025-11-23','20'),
  ('Çınar','Yalçın','2025-11-30','48'),
  ('Çınar','Yalçın','2025-12-07','20'),
  ('Çınar','Yalçın','2025-12-21','50'),
  ('Çınar','Yalçın','2025-12-28','51'),
  ('Çınar','Yalçın','2026-01-03','50'),
  ('Çınar','Yalçın','2026-01-10','60'),

  -- ========================================
  -- 26) Çınar Yağız Ekmen (W10 sonrası)
  -- ========================================
  ('Çınar Yağız','Ekmen','2025-11-16','80'),
  ('Çınar Yağız','Ekmen','2025-11-23','80'),
  ('Çınar Yağız','Ekmen','2025-11-30','80'),
  ('Çınar Yağız','Ekmen','2025-12-07','58'),
  ('Çınar Yağız','Ekmen','2025-12-21','57'),
  ('Çınar Yağız','Ekmen','2026-01-03','40'),
  ('Çınar Yağız','Ekmen','2026-01-10','60'),

  -- ========================================
  -- 27) Taha Ali Aktaş (W13 sonrası)
  -- ========================================
  ('Taha Ali','Aktaş','2025-12-07','40'),
  ('Taha Ali','Aktaş','2025-12-21','40'),
  ('Taha Ali','Aktaş','2025-12-28','40'),
  ('Taha Ali','Aktaş','2026-01-03','40'),
  ('Taha Ali','Aktaş','2026-01-10','40'),
  ('Taha Ali','Aktaş','2026-01-17','40'),
  ('Taha Ali','Aktaş','2026-01-24','40'),

  -- ========================================
  -- 28) Efe Özkan (W13 sonrası)
  -- ========================================
  ('Efe','Özkan','2025-11-30','30'),
  ('Efe','Özkan','2025-12-07','15'),
  ('Efe','Özkan','2025-12-21','29'),
  ('Efe','Özkan','2026-01-03','80'),
  ('Efe','Özkan','2026-01-10','70'),
  ('Efe','Özkan','2026-01-17','25'),

  -- ========================================
  -- 29) Baturay Toguz (W13 sonrası)
  -- ========================================
  ('Baturay','Toguz','2025-12-07','20'),
  ('Baturay','Toguz','2025-12-21','18'),
  ('Baturay','Toguz','2025-12-28','20'),
  ('Baturay','Toguz','2026-01-10','20'),

  -- ========================================
  -- 30) Mustafa Sıraç (W13 sonrası)
  -- ========================================
  ('Mustafa','Sıraç','2025-12-07','65'),
  ('Mustafa','Sıraç','2025-12-21','80'),
  ('Mustafa','Sıraç','2025-12-28','80'),
  ('Mustafa','Sıraç','2026-01-03','80'),
  ('Mustafa','Sıraç','2026-01-10','60');

  -- ===== İşleme =====
  FOR rec IN SELECT * FROM tmp_u14_stats
  LOOP
    -- Oyuncuyu bul (U14 öncelikli)
    SELECT id, first_name || ' ' || last_name, jersey_number, position::text
    INTO v_player_id, v_player_name, v_jersey, v_pos
    FROM players
    WHERE first_name = rec.first_name AND last_name = rec.last_name
    ORDER BY CASE WHEN age_group = 'U14' THEN 0 ELSE 1 END
    LIMIT 1;

    -- Maçı bul (U14!)
    SELECT id INTO v_match_id
    FROM matches
    WHERE date = rec.match_date AND age_group = 'U14'
    LIMIT 1;

    -- Her ikisi de bulunduysa istatistiği ekle
    IF v_player_id IS NOT NULL AND v_match_id IS NOT NULL THEN

      -- Değeri yorumla
      IF rec.stat_value = 'SA' THEN
        v_minutes := 0;
        v_status := NULL;          -- yedek / oynamadı
      ELSIF rec.stat_value = 'C' THEN
        v_minutes := 0;
        v_status := 'suspended';   -- cezalı
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

  RAISE NOTICE 'U14 oyuncu maç istatistikleri eklendi (30 oyuncu, 20 hafta).';
END $$;
