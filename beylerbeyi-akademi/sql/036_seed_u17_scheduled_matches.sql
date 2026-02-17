-- =============================================
-- Migration: 036_seed_u17_scheduled_matches.sql
-- Beylerbeyi Akademi – U17 Oynanmamış Maç Kayıtları (2025-2026 Sezonu)
-- Grup 4 – 2. Yarı (Hafta 20-26) - Henüz oynanmamış maçlar
-- =============================================

INSERT INTO public.matches (
  id, date, season, age_group, opponent, home_away, status, week
) VALUES
  -- Hafta 20: 21 Şubat 2026 - Deplasman - Ayazağaspor
  (gen_random_uuid(), '2026-02-21', '2025-2026', 'U17', 'Ayazağaspor', 'away', 'scheduled', 20),

  -- Hafta 21: 28 Şubat 2026 - Deplasman - İnkılap Spor
  (gen_random_uuid(), '2026-02-28', '2025-2026', 'U17', 'İnkılap Spor', 'away', 'scheduled', 21),

  -- Hafta 22: 7 Mart 2026 - Deplasman - Kavacık
  (gen_random_uuid(), '2026-03-07', '2025-2026', 'U17', 'Kavacık', 'away', 'scheduled', 22),

  -- Hafta 23: 14 Mart 2026 - Deplasman - Küçükçekmece Spor
  (gen_random_uuid(), '2026-03-14', '2025-2026', 'U17', 'Küçükçekmece Spor', 'away', 'scheduled', 23),

  -- Hafta 24: 28 Mart 2026 - Ev - İstanbul Beylikdüzüspor
  (gen_random_uuid(), '2026-03-28', '2025-2026', 'U17', 'İstanbul Beylikdüzüspor', 'home', 'scheduled', 24),

  -- Hafta 25: 4 Nisan 2026 - Deplasman - Zara Ekinlispor
  (gen_random_uuid(), '2026-04-04', '2025-2026', 'U17', 'Zara Ekinlispor', 'away', 'scheduled', 25),

  -- Hafta 26: 8 Nisan 2026 - Ev - Feriköy
  (gen_random_uuid(), '2026-04-08', '2025-2026', 'U17', 'Feriköy', 'home', 'scheduled', 26);

-- =============================================
-- ÖZET: 7 Planlanmış Maç (Hafta 20-26)
--   Ev      : 2 (İstanbul Beylikdüzüspor, Feriköy)
--   Deplasman: 5 (Ayazağaspor, İnkılap Spor, Kavacık, Küçükçekmece Spor, Zara Ekinlispor)
-- Not: Hafta 19 bay haftası (maç yok)
-- =============================================
