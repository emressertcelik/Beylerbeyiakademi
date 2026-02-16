-- =============================================
-- Migration: 023_insert_matches_template.sql
-- Beylerbeyi Akademi – Yeni Maç Ekleme Şablonu
-- =============================================
-- Bu dosya yeni maçları Supabase'e eklemek için kullanılır.
-- Excel'den verileri alıp aşağıdaki formatta SQL'e dönüştürün.
--
-- KULLANIM:
--   1. Aşağıdaki INSERT ifadesindeki örnek satırları silin
--   2. Excel'deki verileri aynı formatta yapıştırın
--   3. Supabase SQL Editor'de çalıştırın
--
-- ALAN AÇIKLAMALARI:
--   date           : Maç tarihi (YYYY-MM-DD)
--   season         : Sezon (örn: 2025-2026)
--   age_group      : Yaş grubu (U14, U15, U16, U19)
--   opponent       : Rakip takım adı
--   home_away      : Ev sahibi/deplasman (home / away)
--   status         : Maç durumu (scheduled / played / cancelled / postponed)
--   score_home     : Ev sahibi skoru (oynanmamışsa 0)
--   score_away     : Deplasman skoru (oynanmamışsa 0)
--   result         : Sonuç (W = Galibiyet, L = Mağlubiyet, D = Beraberlik, null = henüz oynanmadı)
--   venue          : Maç yeri
--   notes          : Notlar (isteğe bağlı)
--   week           : Hafta numarası (isteğe bağlı)
--   match_time     : Maç saati (HH:MM formatında, isteğe bağlı)
--   gathering_time : Toplanma saati (HH:MM formatında, isteğe bağlı)
--   gathering_location : Toplanma yeri (isteğe bağlı)
-- =============================================

-- ========================================
-- 1) MAÇ EKLE (matches tablosu)
-- ========================================
INSERT INTO public.matches (
  id,
  date,
  season,
  age_group,
  opponent,
  home_away,
  status,
  score_home,
  score_away,
  result,
  venue,
  notes,
  week,
  match_time,
  gathering_time,
  gathering_location
) VALUES
  -- ===== ÖRNEK VERİLER (Bunları kendi verilerinizle değiştirin) =====

  -- U15 Maçları
  (gen_random_uuid(), '2026-02-15', '2025-2026', 'U15', 'KAVACIK', 'home', 'scheduled', 0, 0, NULL, 'Beylerbeyi 75.Yıl', NULL, 14, '13:00', '11:30', 'Beylerbeyi 75.Yıl'),
  (gen_random_uuid(), '2026-02-22', '2025-2026', 'U15', 'İNKILAP', 'away', 'scheduled', 0, 0, NULL, 'İnkılap Sahası', NULL, 15, '14:00', '12:00', 'Beylerbeyi 75.Yıl'),

  -- U16 Maçları
  (gen_random_uuid(), '2026-02-15', '2025-2026', 'U16', 'GEBZE', 'away', 'scheduled', 0, 0, NULL, 'Tavşancıl', NULL, 14, '15:00', '13:00', 'Beylerbeyi 75.Yıl'),

  -- U14 Maçları
  (gen_random_uuid(), '2026-02-16', '2025-2026', 'U14', 'SAKARYA TEK', 'home', 'scheduled', 0, 0, NULL, 'Beylerbeyi 75.Yıl', NULL, 14, '11:00', '09:30', 'Beylerbeyi 75.Yıl'),

  -- U19 Maçları
  (gen_random_uuid(), '2026-02-16', '2025-2026', 'U19', 'PANAYIR', 'home', 'scheduled', 0, 0, NULL, 'Beylerbeyi 75.Yıl', 'Önemli maç', 14, '16:00', '14:30', 'Beylerbeyi 75.Yıl');


-- ========================================
-- 2) OYNANAN MAÇ SONUCU GÜNCELLEME
-- ========================================
-- Maç oylandıktan sonra skorları güncellemek için:
--
-- UPDATE public.matches
-- SET
--   status = 'played',
--   score_home = 3,
--   score_away = 1,
--   result = 'W',
--   updated_at = now()
-- WHERE date = '2026-02-15'
--   AND age_group = 'U15'
--   AND opponent = 'KAVACIK';


-- ========================================
-- 3) OYUNCU İSTATİSTİKLERİ EKLE (match_player_stats tablosu)
-- ========================================
-- Maç oylandıktan sonra oyuncu istatistiklerini eklemek için:
-- Önce maç ID'sini bulun, sonra istatistikleri ekleyin.
--
-- ALAN AÇIKLAMALARI:
--   match_id             : Maç ID'si (matches tablosundan)
--   player_id            : Oyuncu ID'si (players tablosundan)
--   player_name          : Oyuncu adı
--   jersey_number        : Forma numarası
--   position             : Pozisyon (Kaleci, Defans, Orta Saha, Forvet)
--   participation_status : Katılım durumu (pisman, gelmedi, hasta, izinli, cezali, sakat)
--   minutes_played       : Oynanan dakika
--   goals                : Gol sayısı
--   assists              : Asist sayısı
--   yellow_cards         : Sarı kart
--   red_cards            : Kırmızı kart
--   goals_conceded       : Yenen gol (kaleciler için)
--   clean_sheet          : Gol yememe (kaleciler için, true/false)
--   rating               : Performans puanı (1-10)

-- Örnek: Belirli bir maçın oyuncu istatistikleri
-- DO $$
-- DECLARE
--   v_match_id uuid;
-- BEGIN
--   SELECT id INTO v_match_id FROM public.matches
--   WHERE date = '2026-02-15' AND age_group = 'U15' AND opponent = 'KAVACIK';
--
--   INSERT INTO public.match_player_stats (
--     id, match_id, player_id, player_name, jersey_number, position,
--     participation_status, minutes_played, goals, assists,
--     yellow_cards, red_cards, goals_conceded, clean_sheet, rating
--   ) VALUES
--     (gen_random_uuid(), v_match_id, 'OYUNCU_UUID_1', 'Ali Yılmaz', 10, 'Orta Saha', NULL, 90, 2, 1, 0, 0, 0, false, 8.5),
--     (gen_random_uuid(), v_match_id, 'OYUNCU_UUID_2', 'Mehmet Demir', 1, 'Kaleci', NULL, 90, 0, 0, 0, 0, 1, false, 7.0),
--     (gen_random_uuid(), v_match_id, 'OYUNCU_UUID_3', 'Can Özkan', 7, 'Forvet', NULL, 75, 1, 0, 1, 0, 0, false, 7.5);
-- END $$;


-- ========================================
-- 4) TOPLU MAÇ SİLME (dikkatli kullanın!)
-- ========================================
-- Belirli bir yaş grubunun tüm planlanmış maçlarını silmek için:
--
-- DELETE FROM public.matches
-- WHERE age_group = 'U15'
--   AND season = '2025-2026'
--   AND status = 'scheduled';


-- ========================================
-- 5) HIZLI SORGULAR
-- ========================================
-- Bir yaş grubunun tüm maçlarını listele:
-- SELECT date, opponent, home_away, score_home, score_away, result, venue, week
-- FROM public.matches
-- WHERE age_group = 'U15' AND season = '2025-2026'
-- ORDER BY date;

-- Bir oyuncunun tüm istatistiklerini listele:
-- SELECT m.date, m.opponent, s.goals, s.assists, s.minutes_played, s.rating
-- FROM public.match_player_stats s
-- JOIN public.matches m ON m.id = s.match_id
-- WHERE s.player_name = 'Ali Yılmaz'
-- ORDER BY m.date;
