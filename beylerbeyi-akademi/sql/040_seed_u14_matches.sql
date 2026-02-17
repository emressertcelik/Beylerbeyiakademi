-- =============================================
-- Migration: 040_seed_u14_matches.sql
-- Beylerbeyi Akademi – U14 Maç Kayıtları (2025-2026 Sezonu)
-- Grup 5 – 25 Maç (1. Yarı: Hafta 1-13, 2. Yarı: Hafta 14-26, Hafta 21 yok)
-- =============================================

INSERT INTO public.matches (
  id, date, season, age_group, opponent, home_away, status,
  score_home, score_away, result, week
) VALUES
  -- ===== 1. YARI =====

  -- Hafta 1: 13 Eylül 2025 - Deplasman - Kavacık Spor (0-3 Mağlubiyet)
  (gen_random_uuid(), '2025-09-13', '2025-2026', 'U14', 'Kavacık Spor', 'away', 'played', 0, 3, 'L', 1),

  -- Hafta 2: 21 Eylül 2025 - Ev - İnkılap Spor (2-1 Galibiyet)
  (gen_random_uuid(), '2025-09-21', '2025-2026', 'U14', 'İnkılap Spor', 'home', 'played', 2, 1, 'W', 2),

  -- Hafta 3: 28 Eylül 2025 - Deplasman - Beyoğlu Yeni Çarşı (2-2 Beraberlik)
  (gen_random_uuid(), '2025-09-28', '2025-2026', 'U14', 'Beyoğlu Yeni Çarşı', 'away', 'played', 2, 2, 'D', 3),

  -- Hafta 4: 5 Ekim 2025 - Ev - İnegöl Kafkas (0-4 Mağlubiyet)
  (gen_random_uuid(), '2025-10-05', '2025-2026', 'U14', 'İnegöl Kafkas', 'home', 'played', 0, 4, 'L', 4),

  -- Hafta 5: 12 Ekim 2025 - Deplasman - Kestel Çilek (2-4 Mağlubiyet)
  (gen_random_uuid(), '2025-10-12', '2025-2026', 'U14', 'Kestel Çilek', 'away', 'played', 2, 4, 'L', 5),

  -- Hafta 6: 19 Ekim 2025 - Ev - Panayır Spor (2-4 Mağlubiyet)
  (gen_random_uuid(), '2025-10-19', '2025-2026', 'U14', 'Panayır Spor', 'home', 'played', 2, 4, 'L', 6),

  -- Hafta 7: 26 Ekim 2025 - Deplasman - Gebze Spor (3-6 Mağlubiyet)
  (gen_random_uuid(), '2025-10-26', '2025-2026', 'U14', 'Gebze Spor', 'away', 'played', 3, 6, 'L', 7),

  -- Hafta 8: 2 Kasım 2025 - Ev - Değirmendere Spor (2-4 Mağlubiyet)
  (gen_random_uuid(), '2025-11-02', '2025-2026', 'U14', 'Değirmendere Spor', 'home', 'played', 2, 4, 'L', 8),

  -- Hafta 9: 9 Kasım 2025 - Deplasman - Gölcük Spor (1-3 Mağlubiyet)
  (gen_random_uuid(), '2025-11-09', '2025-2026', 'U14', 'Gölcük Spor', 'away', 'played', 1, 3, 'L', 9),

  -- Hafta 10: 16 Kasım 2025 - Ev - Sakarya Tek Spor (6-1 Galibiyet)
  (gen_random_uuid(), '2025-11-16', '2025-2026', 'U14', 'Sakarya Tek Spor', 'home', 'played', 6, 1, 'W', 10),

  -- Hafta 11: 23 Kasım 2025 - Deplasman - Zara Ekinli (1-1 Beraberlik)
  (gen_random_uuid(), '2025-11-23', '2025-2026', 'U14', 'Zara Ekinli', 'away', 'played', 1, 1, 'D', 11),

  -- Hafta 12: 30 Kasım 2025 - Ev - Bulvar Spor (1-5 Mağlubiyet)
  (gen_random_uuid(), '2025-11-30', '2025-2026', 'U14', 'Bulvar Spor', 'home', 'played', 1, 5, 'L', 12),

  -- Hafta 13: 7 Aralık 2025 - Deplasman - Karacabey Belediye (4-0 Galibiyet)
  (gen_random_uuid(), '2025-12-07', '2025-2026', 'U14', 'Karacabey Belediye', 'away', 'played', 4, 0, 'W', 13),

  -- ===== 2. YARI =====

  -- Hafta 14: 21 Aralık 2025 - Ev - Kavacık Spor (4-0 Galibiyet)
  (gen_random_uuid(), '2025-12-21', '2025-2026', 'U14', 'Kavacık Spor', 'home', 'played', 4, 0, 'W', 14),

  -- Hafta 15: 28 Aralık 2025 - Deplasman - İnkılap Spor (2-3 Mağlubiyet)
  (gen_random_uuid(), '2025-12-28', '2025-2026', 'U14', 'İnkılap Spor', 'away', 'played', 2, 3, 'L', 15),

  -- Hafta 16: 3 Ocak 2026 - Ev - Beyoğlu Yeni Çarşı (2-1 Galibiyet)
  (gen_random_uuid(), '2026-01-03', '2025-2026', 'U14', 'Beyoğlu Yeni Çarşı', 'home', 'played', 2, 1, 'W', 16),

  -- Hafta 17: 10 Ocak 2026 - Deplasman - İnegöl Kafkas (0-3 Mağlubiyet)
  (gen_random_uuid(), '2026-01-10', '2025-2026', 'U14', 'İnegöl Kafkas', 'away', 'played', 0, 3, 'L', 17),

  -- Hafta 18: 17 Ocak 2026 - Ev - Kestel Çilek (1-2 Mağlubiyet)
  (gen_random_uuid(), '2026-01-17', '2025-2026', 'U14', 'Kestel Çilek', 'home', 'played', 1, 2, 'L', 18),

  -- Hafta 19: 24 Ocak 2026 - Deplasman - Panayır Spor (1-3 Mağlubiyet)
  (gen_random_uuid(), '2026-01-24', '2025-2026', 'U14', 'Panayır Spor', 'away', 'played', 1, 3, 'L', 19),

  -- Hafta 20: 1 Şubat 2026 - Ev - Gebze Spor (1-1 Beraberlik)
  (gen_random_uuid(), '2026-02-01', '2025-2026', 'U14', 'Gebze Spor', 'home', 'played', 1, 1, 'D', 20),

  -- Hafta 21: YOK (fixture'da bulunmuyor)

  -- Hafta 22: 22 Şubat 2026 - Ev - Gölcük Spor (Planlandı)
  (gen_random_uuid(), '2026-02-22', '2025-2026', 'U14', 'Gölcük Spor', 'home', 'scheduled', 0, 0, 'D', 22),

  -- Hafta 23: 1 Mart 2026 - Deplasman - Sakarya Tek Spor (Planlandı)
  (gen_random_uuid(), '2026-03-01', '2025-2026', 'U14', 'Sakarya Tek Spor', 'away', 'scheduled', 0, 0, 'D', 23),

  -- Hafta 24: 8 Mart 2026 - Ev - Zara Ekinli (Planlandı)
  (gen_random_uuid(), '2026-03-08', '2025-2026', 'U14', 'Zara Ekinli', 'home', 'scheduled', 0, 0, 'D', 24),

  -- Hafta 25: 15 Mart 2026 - Deplasman - Bulvar Spor (Planlandı)
  (gen_random_uuid(), '2026-03-15', '2025-2026', 'U14', 'Bulvar Spor', 'away', 'scheduled', 0, 0, 'D', 25),

  -- Hafta 26: 18 Mart 2026 - Ev - Karacabey Belediye (Planlandı)
  (gen_random_uuid(), '2026-03-18', '2025-2026', 'U14', 'Karacabey Belediye', 'home', 'scheduled', 0, 0, 'D', 26);

-- =============================================
-- ÖZET: 25 Maç (Hafta 21 yok)
--   Oynanan  : 20
--   Planlandı: 5
--   Galibiyet : 5  (İnkılap Spor, Sakarya Tek Spor, Karacabey Belediye, Kavacık Spor(2), Beyoğlu Yeni Çarşı(2))
--   Beraberlik: 3  (Beyoğlu Yeni Çarşı, Zara Ekinli, Gebze Spor(2))
--   Mağlubiyet: 12 (Kavacık Spor, İnegöl Kafkas, Kestel Çilek, Panayır Spor, Gebze Spor, Değirmendere Spor, Gölcük Spor, Bulvar Spor, İnkılap Spor(2), İnegöl Kafkas(2), Kestel Çilek(2), Panayır Spor(2))
--   Atılan gol: 37 | Yenilen gol: 51
-- =============================================
