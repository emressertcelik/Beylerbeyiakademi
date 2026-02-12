-- =============================================
-- Migration: 013_seed_matches.sql
-- Beylerbeyi Akademi – Toplu Maç Ekleme
-- =============================================

-- 22 maçlık toplu veri ekleme örneği
-- NOT: Exceldeki verileri aşağıdaki formatta doldurabilirsiniz.

INSERT INTO public.matches (
  id, date, season, age_group, opponent, home_away, status, score_home, score_away, result, venue, notes
) VALUES
  -- Örnek veri
  (gen_random_uuid(), '2025-09-01', '2025-2026', 'U15', 'Beşiktaş', 'home', 'played', 2, 1, 'W', 'Beylerbeyi Stadı', 'Sezon açılışı'),
  (gen_random_uuid(), '2025-09-08', '2025-2026', 'U15', 'Galatasaray', 'away', 'played', 1, 3, 'L', 'Florya', 'Zor maç'),
  -- ...
  -- Buraya 20 maç daha ekleyin
  (gen_random_uuid(), '2025-10-01', '2025-2026', 'U15', 'Fenerbahçe', 'home', 'played', 0, 0, 'D', 'Beylerbeyi Stadı', 'Beraberlik');

-- Not: Her maç için player stats eklemek isterseniz, match_player_stats tablosuna da benzer şekilde ekleme yapabilirsiniz.
-- Örnek:
-- INSERT INTO public.match_player_stats (id, match_id, player_id, player_name, jersey_number, position, minutes_played, goals, assists, yellow_cards, red_cards, goals_conceded, clean_sheet, rating)
-- VALUES (...);

-- Exceldeki verileri bu formatta SQL'e dönüştürüp dosyaya ekleyebilirsiniz.

-- Aşağıdaki veriler kullanıcıdan alınan Excel tablosundan eklenmiştir
INSERT INTO public.matches (
  id, date, season, age_group, opponent, home_away, status, score_home, score_away, result, venue, notes
) VALUES
  (gen_random_uuid(), '2025-09-13', '2025-2026', 'U15', 'KAVACIK', 'home', 'played', 0, 0, 'D', 'Kavacık', 'Saat: 13:00'),
  (gen_random_uuid(), '2025-09-21', '2025-2026', 'U15', 'İNKILAP', 'home', 'played', 0, 0, 'D', 'Beylerbeyi 75.Yıl', 'Saat: 13:00'),
  (gen_random_uuid(), '2025-09-28', '2025-2026', 'U15', 'BEYOĞLU YENİ ÇARŞI', 'away', 'played', 0, 0, 'D', 'Beyoğlu', 'Saat: 13:00'),
  (gen_random_uuid(), '2025-10-05', '2025-2026', 'U15', 'İNEGÖL KAFKAS', 'home', 'played', 0, 0, 'D', 'Beylerbeyi 75.Yıl', 'Saat: 13:00'),
  (gen_random_uuid(), '2025-10-13', '2025-2026', 'U15', 'KESTEL ÇİLEK', 'away', 'played', 0, 0, 'D', 'Kestel', 'Saat: 13:00'),
  (gen_random_uuid(), '2025-10-19', '2025-2026', 'U15', 'PANAYIR', 'home', 'played', 0, 0, 'D', 'Beylerbeyi 75.Yıl', 'Saat: 13:00'),
  (gen_random_uuid(), '2025-10-25', '2025-2026', 'U15', 'GEBZE', 'away', 'played', 0, 0, 'D', 'Tavşancıl', 'Saat: 13:00'),
  (gen_random_uuid(), '2025-11-02', '2025-2026', 'U15', 'DEĞİRMENDERE', 'home', 'played', 0, 0, 'D', 'Beylerbeyi 75.Yıl', 'Saat: 13:00'),
  (gen_random_uuid(), '2025-11-09', '2025-2026', 'U15', 'GÖLCÜK', 'away', 'played', 0, 0, 'D', 'Gölcük', 'Saat: 13:00'),
  (gen_random_uuid(), '2025-11-16', '2025-2026', 'U15', 'SAKARYA TEK', 'home', 'played', 0, 0, 'D', 'Beylerbeyi 75.Yıl', 'Saat: 13:00'),
  (gen_random_uuid(), '2025-11-23', '2025-2026', 'U15', 'ZARA EKİNLİ', 'away', 'played', 0, 0, 'D', 'Zara Ekinli', 'Saat: 13:00'),
  (gen_random_uuid(), '2025-10-30', '2025-2026', 'U15', 'BULVAR', 'home', 'played', 0, 0, 'D', 'Beylerbeyi 75.Yıl', 'Saat: 13:00'),
  (gen_random_uuid(), '2025-12-07', '2025-2026', 'U15', 'KARACABEY', 'away', 'played', 0, 0, 'D', 'Karacabey', 'Saat: 13:00');
