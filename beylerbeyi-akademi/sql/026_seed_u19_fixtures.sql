-- =============================================
-- Migration: 026_seed_u19_fixtures.sql
-- Beylerbeyi Akademi – U19 Kalan Fikstür (2025-2026 Sezonu)
-- Henüz oynanmamış maçlar
-- =============================================

INSERT INTO public.matches (
  id, date, season, age_group, opponent, home_away, status,
  score_home, score_away, week
) VALUES
  -- Hafta 22: 11 Şubat 2026 - Deplasman - Dudullu
  (gen_random_uuid(), '2026-02-11', '2025-2026', 'U19', 'Dudullu', 'away', 'scheduled', 0, 0, 22),

  -- Hafta 23: 25 Şubat 2026 - Deplasman - Gebze Spor
  (gen_random_uuid(), '2026-02-25', '2025-2026', 'U19', 'Gebze Spor', 'away', 'scheduled', 0, 0, 23),

  -- Hafta 24: 4 Mart 2026 - Ev - Paşabahçe
  (gen_random_uuid(), '2026-03-04', '2025-2026', 'U19', 'Paşabahçe', 'home', 'scheduled', 0, 0, 24),

  -- Hafta 25: 11 Mart 2026 - Deplasman - Karacabey Belediye
  (gen_random_uuid(), '2026-03-11', '2025-2026', 'U19', 'Karacabey Belediye', 'away', 'scheduled', 0, 0, 25),

  -- Hafta 26: 25 Mart 2026 - Ev - Kullar 1975 Spor
  (gen_random_uuid(), '2026-03-25', '2025-2026', 'U19', 'Kullar 1975 Spor', 'home', 'scheduled', 0, 0, 26),

  -- Hafta 27: 1 Nisan 2026 - Deplasman - Yalova FK 77 Spor
  (gen_random_uuid(), '2026-04-01', '2025-2026', 'U19', 'Yalova FK 77 Spor', 'away', 'scheduled', 0, 0, 27),

  -- Hafta 28: 8 Nisan 2026 - Ev - Maltepespor
  (gen_random_uuid(), '2026-04-08', '2025-2026', 'U19', 'Maltepespor', 'home', 'scheduled', 0, 0, 28),

  -- Hafta 29: 15 Nisan 2026 - Deplasman - Beykoz Anadolu Spor
  (gen_random_uuid(), '2026-04-15', '2025-2026', 'U19', 'Beykoz Anadolu Spor', 'away', 'scheduled', 0, 0, 29);

-- =============================================
-- ÖZET: 8 Maç (Kalan Fikstür - Henüz Oynanmadı)
--   Şubat : Dudullu (D), Gebze Spor (D)
--   Mart  : Paşabahçe (E), Karacabey Belediye (D), Kullar 1975 Spor (E)
--   Nisan : Yalova FK 77 (D), Maltepespor (E), Beykoz Anadolu (D)
-- =============================================
