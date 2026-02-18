-- =============================================
-- Migration: 048_seed_u15_matches.sql
-- Beylerbeyi Akademi – U15 Maç Kayıtları (2025-2026 Sezonu)
-- Grup 5 – 2. Yarı: Hafta 14-26 (Hafta 21 yok)
-- NOT: 1. Yarı (Hafta 1-13) verileri mevcut olduğunda ayrı migration ile eklenecek
-- =============================================

INSERT INTO public.matches (
  id, date, season, age_group, opponent, home_away, status,
  score_home, score_away, result, week
) VALUES
  -- ===== 2. YARI =====

  -- Hafta 14: 28 Ocak 2026 - Ev - Kavacık Spor (1-2 Mağlubiyet)
  (gen_random_uuid(), '2026-01-28', '2025-2026', 'U15', 'Kavacık Spor', 'home', 'played', 1, 2, 'L', 14),

  -- Hafta 15: 3 Şubat 2026 - Deplasman - İnkılap Spor (6-1 Galibiyet)
  (gen_random_uuid(), '2026-02-03', '2025-2026', 'U15', 'İnkılap Spor', 'away', 'played', 1, 6, 'W', 15),

  -- Hafta 16: 10 Şubat 2026 - Ev - Beyoğlu Yeni Çarşı (1-1 Beraberlik)
  (gen_random_uuid(), '2026-02-10', '2025-2026', 'U15', 'Beyoğlu Yeni Çarşı', 'home', 'played', 1, 1, 'D', 16),

  -- Hafta 17: 18 Şubat 2026 - Deplasman - İnegöl Kafkas (3-1 Galibiyet)
  (gen_random_uuid(), '2026-02-18', '2025-2026', 'U15', 'İnegöl Kafkas', 'away', 'played', 1, 3, 'W', 17),

  -- Hafta 18: 25 Şubat 2026 - Ev - Kestel Çilek (3-0 Galibiyet)
  (gen_random_uuid(), '2026-02-25', '2025-2026', 'U15', 'Kestel Çilek', 'home', 'played', 3, 0, 'W', 18),

  -- Hafta 19: 1 Mart 2026 - Deplasman - Panayır Spor (1-3 Mağlubiyet)
  (gen_random_uuid(), '2026-03-01', '2025-2026', 'U15', 'Panayır Spor', 'away', 'played', 3, 1, 'L', 19),

  -- Hafta 20: 7 Mart 2026 - Ev - Gebze Spor (2-1 Galibiyet)
  (gen_random_uuid(), '2026-03-07', '2025-2026', 'U15', 'Gebze Spor', 'home', 'played', 2, 1, 'W', 20),

  -- Hafta 21: YOK (fixture'da bulunmuyor)

  -- Hafta 22: 22 Mart 2026 - Ev - Gölcük Spor (Planlandı)
  (gen_random_uuid(), '2026-03-22', '2025-2026', 'U15', 'Gölcük Spor', 'home', 'scheduled', 0, 0, 'D', 22),

  -- Hafta 23: 1 Nisan 2026 - Deplasman - Sakarya Tek Spor (Planlandı)
  (gen_random_uuid(), '2026-04-01', '2025-2026', 'U15', 'Sakarya Tek Spor', 'away', 'scheduled', 0, 0, 'D', 23),

  -- Hafta 24: 8 Nisan 2026 - Ev - Zara Ekinli (Planlandı)
  (gen_random_uuid(), '2026-04-08', '2025-2026', 'U15', 'Zara Ekinli', 'home', 'scheduled', 0, 0, 'D', 24),

  -- Hafta 25: 14 Nisan 2026 - Deplasman - Bulvar Spor (Planlandı)
  (gen_random_uuid(), '2026-04-14', '2025-2026', 'U15', 'Bulvar Spor', 'away', 'scheduled', 0, 0, 'D', 25),

  -- Hafta 26: 18 Nisan 2026 - Ev - Karacabey Belediye (Planlandı)
  (gen_random_uuid(), '2026-04-18', '2025-2026', 'U15', 'Karacabey Belediye', 'home', 'scheduled', 0, 0, 'D', 26);

-- =============================================
-- ÖZET: 12 Maç (2. Yarı, Hafta 21 yok)
--   Oynanan  : 7  (Hafta 14-20)
--   Planlandı: 5  (Hafta 22-26)
--   Galibiyet : 4  (İnkılap Spor, İnegöl Kafkas, Kestel Çilek, Gebze Spor)
--   Beraberlik: 1  (Beyoğlu Yeni Çarşı)
--   Mağlubiyet: 2  (Kavacık Spor, Panayır Spor)
--   Atılan gol: 17 | Yenilen gol: 9
-- =============================================
