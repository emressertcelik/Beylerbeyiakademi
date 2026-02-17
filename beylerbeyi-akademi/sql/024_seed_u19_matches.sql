-- =============================================
-- Migration: 024_seed_u19_matches.sql
-- Beylerbeyi Akademi – U19 1. Yarı Maç Kayıtları (2025-2026 Sezonu)
-- =============================================

INSERT INTO public.matches (
  id, date, season, age_group, opponent, home_away, status,
  score_home, score_away, result, week
) VALUES
  -- Hafta 1: 17 Eylül 2025 - Ev - Sancaktepe Spor (0-3 Mağlubiyet)
  (gen_random_uuid(), '2025-09-17', '2025-2026', 'U19', 'Sancaktepe Spor', 'home', 'played', 0, 3, 'L', 1),

  -- Hafta 2: 24 Eylül 2025 - Deplasman - Gölcükspor (1-3 Mağlubiyet)
  (gen_random_uuid(), '2025-09-24', '2025-2026', 'U19', 'Gölcükspor', 'away', 'played', 1, 3, 'L', 2),

  -- Hafta 3: 1 Ekim 2025 - Ev - Kestel Çilek (1-1 Beraberlik)
  (gen_random_uuid(), '2025-10-01', '2025-2026', 'U19', 'Kestel Çilek', 'home', 'played', 1, 1, 'D', 3),

  -- Hafta 4: 8 Ekim 2025 - Deplasman - Bulvarspor (1-3 Mağlubiyet)
  (gen_random_uuid(), '2025-10-08', '2025-2026', 'U19', 'Bulvarspor', 'away', 'played', 1, 3, 'L', 4),

  -- Hafta 5: 15 Ekim 2025 - Ev - Kartal Spor. (1-2 Mağlubiyet)
  (gen_random_uuid(), '2025-10-15', '2025-2026', 'U19', 'Kartal Spor.', 'home', 'played', 1, 2, 'L', 5),

  -- Hafta 6: 22 Ekim 2025 - Deplasman - Sultanbeyli Belediye Spor (0-1 Mağlubiyet)
  (gen_random_uuid(), '2025-10-22', '2025-2026', 'U19', 'Sultanbeyli Belediye Spor', 'away', 'played', 0, 1, 'L', 6),

  -- Hafta 7: 29 Ekim 2025 - Ev - Dudullu (1-1 Beraberlik)
  (gen_random_uuid(), '2025-10-29', '2025-2026', 'U19', 'Dudullu', 'home', 'played', 1, 1, 'D', 7),

  -- Hafta 8: 5 Kasım 2025 - Deplasman - İnkılap Spor (5-3 Galibiyet)
  (gen_random_uuid(), '2025-11-05', '2025-2026', 'U19', 'İnkılap Spor', 'away', 'played', 5, 3, 'W', 8),

  -- Hafta 9: 12 Kasım 2025 - Ev - Gebze Spor (0-1 Mağlubiyet)
  (gen_random_uuid(), '2025-11-12', '2025-2026', 'U19', 'Gebze Spor', 'home', 'played', 0, 1, 'L', 9),

  -- Hafta 10: 19 Kasım 2025 - Deplasman - Paşabahçe (2-1 Galibiyet)
  (gen_random_uuid(), '2025-11-19', '2025-2026', 'U19', 'Paşabahçe', 'away', 'played', 2, 1, 'W', 10),

  -- Hafta 11: 26 Kasım 2025 - Ev - Karacabey Belediye (0-0 Beraberlik)
  (gen_random_uuid(), '2025-11-26', '2025-2026', 'U19', 'Karacabey Belediye', 'home', 'played', 0, 0, 'D', 11),

  -- Hafta 12: 3 Aralık 2025 - Deplasman - Kullar 1975 Spor (1-0 Galibiyet)
  (gen_random_uuid(), '2025-12-03', '2025-2026', 'U19', 'Kullar 1975 Spor', 'away', 'played', 1, 0, 'W', 12),

  -- Hafta 13: 10 Aralık 2025 - Ev - Yalova FK 77 Spor (1-1 Beraberlik)
  (gen_random_uuid(), '2025-12-10', '2025-2026', 'U19', 'Yalova FK 77 Spor', 'home', 'played', 1, 1, 'D', 13),

  -- Hafta 14: 17 Aralık 2025 - Deplasman - Maltepespor (1-0 Galibiyet)
  (gen_random_uuid(), '2025-12-17', '2025-2026', 'U19', 'Maltepespor', 'away', 'played', 1, 0, 'W', 14),

  -- Hafta 15: 24 Aralık 2025 - Ev - Beykoz Anadolu Spor (1-1 Beraberlik)
  (gen_random_uuid(), '2025-12-24', '2025-2026', 'U19', 'Beykoz Anadolu Spor', 'home', 'played', 1, 1, 'D', 15);

-- =============================================
-- ÖZET: 15 Maç (1. Yarı)
--   Galibiyet : 4 (İnkılap Spor, Paşabahçe, Kullar 1975, Maltepespor)
--   Beraberlik: 5 (Kestel Çilek, Dudullu, Karacabey Bel., Yalova FK 77, Beykoz Anadolu)
--   Mağlubiyet: 6 (Sancaktepe, Gölcükspor, Bulvarspor, Kartal Spor, Sultanbeyli, Gebze)
--   Atılan gol: 16 | Yenilen gol: 22
-- =============================================
