-- =============================================
-- Migration: 025_seed_u19_matches_2nd_half.sql
-- Beylerbeyi Akademi – U19 2. Yarı Maç Kayıtları (2025-2026 Sezonu)
-- =============================================

INSERT INTO public.matches (
  id, date, season, age_group, opponent, home_away, status,
  score_home, score_away, result, week
) VALUES
  -- Hafta 16: 29 Aralık 2025 - Deplasman - Sancaktepe Spor (2-0 Galibiyet)
  (gen_random_uuid(), '2025-12-29', '2025-2026', 'U19', 'Sancaktepe Spor', 'away', 'played', 2, 0, 'W', 16),

  -- Hafta 17: 7 Ocak 2026 - Ev - Gölcükspor (2-4 Mağlubiyet)
  (gen_random_uuid(), '2026-01-07', '2025-2026', 'U19', 'Gölcükspor', 'home', 'played', 2, 4, 'L', 17),

  -- Hafta 18: 14 Ocak 2026 - Deplasman - Kestel Çilek (2-1 Galibiyet)
  (gen_random_uuid(), '2026-01-14', '2025-2026', 'U19', 'Kestel Çilek', 'away', 'played', 2, 1, 'W', 18),

  -- Hafta 19: 21 Ocak 2026 - Ev - Bulvarspor (0-2 Mağlubiyet)
  (gen_random_uuid(), '2026-01-21', '2025-2026', 'U19', 'Bulvarspor', 'home', 'played', 0, 2, 'L', 19),

  -- Hafta 20: 28 Ocak 2026 - Deplasman - Kartal Spor. (1-1 Beraberlik)
  (gen_random_uuid(), '2026-01-28', '2025-2026', 'U19', 'Kartal Spor.', 'away', 'played', 1, 1, 'D', 20),

  -- Hafta 21: 4 Şubat 2026 - Ev - Sultanbeyli Belediye Spor (1-5 Mağlubiyet)
  (gen_random_uuid(), '2026-02-04', '2025-2026', 'U19', 'Sultanbeyli Belediye Spor', 'home', 'played', 1, 5, 'L', 21);

-- =============================================
-- ÖZET: 6 Maç (2. Yarı)
--   Galibiyet : 2 (Sancaktepe Spor, Kestel Çilek)
--   Beraberlik: 1 (Kartal Spor.)
--   Mağlubiyet: 3 (Gölcükspor, Bulvarspor, Sultanbeyli Belediye)
--   Atılan gol: 8 | Yenilen gol: 13
-- =============================================
