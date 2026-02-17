-- =============================================
-- Migration: 035_seed_u16_matches.sql
-- Beylerbeyi Akademi – U16 Maç Kayıtları (2025-2026 Sezonu)
-- Grup 4 – 18 Maç (1. Yarı: Hafta 1-13, 2. Yarı: Hafta 14-18)
-- =============================================

INSERT INTO public.matches (
  id, date, season, age_group, opponent, home_away, status,
  score_home, score_away, result, week
) VALUES
  -- ===== 1. YARI =====

  -- Hafta 1: 20 Eylül 2025 - Ev - Tunç Spor (7-0 Galibiyet)
  (gen_random_uuid(), '2025-09-20', '2025-2026', 'U16', 'Tunç Spor', 'home', 'played', 7, 0, 'W', 1),

  -- Hafta 2: 27 Eylül 2025 - Deplasman - İstanbul Gençlerbirliği (3-1 Galibiyet)
  (gen_random_uuid(), '2025-09-27', '2025-2026', 'U16', 'İstanbul Gençlerbirliği', 'away', 'played', 3, 1, 'W', 2),

  -- Hafta 3: 4 Ekim 2025 - Ev - Güngören Belediyesi (2-2 Beraberlik)
  (gen_random_uuid(), '2025-10-04', '2025-2026', 'U16', 'Güngören Belediyesi', 'home', 'played', 2, 2, 'D', 3),

  -- Hafta 4: 11 Ekim 2025 - Deplasman - Küçükçekmece Sinop (1-0 Galibiyet)
  (gen_random_uuid(), '2025-10-11', '2025-2026', 'U16', 'Küçükçekmece Sinop', 'away', 'played', 1, 0, 'W', 4),

  -- Hafta 5: 18 Ekim 2025 - Ev - Arnavutköy (0-2 Mağlubiyet)
  (gen_random_uuid(), '2025-10-18', '2025-2026', 'U16', 'Arnavutköy', 'home', 'played', 0, 2, 'L', 5),

  -- Hafta 6: 25 Ekim 2025 - Deplasman - Başakşehirspor (4-1 Galibiyet)
  (gen_random_uuid(), '2025-10-25', '2025-2026', 'U16', 'Başakşehirspor', 'away', 'played', 4, 1, 'W', 6),

  -- Hafta 7: 1 Kasım 2025 - Ev - Ayazağaspor (4-2 Galibiyet)
  (gen_random_uuid(), '2025-11-01', '2025-2026', 'U16', 'Ayazağaspor', 'home', 'played', 4, 2, 'W', 7),

  -- Hafta 8: 8 Kasım 2025 - Deplasman - İnkılap Spor (2-2 Beraberlik)
  (gen_random_uuid(), '2025-11-08', '2025-2026', 'U16', 'İnkılap Spor', 'away', 'played', 2, 2, 'D', 8),

  -- Hafta 9: 15 Kasım 2025 - Ev - Kavacık (8-0 Galibiyet)
  (gen_random_uuid(), '2025-11-15', '2025-2026', 'U16', 'Kavacık', 'home', 'played', 8, 0, 'W', 9),

  -- Hafta 10: 22 Kasım 2025 - Deplasman - Küçükçekmece Spor (2-0 Galibiyet)
  (gen_random_uuid(), '2025-11-22', '2025-2026', 'U16', 'Küçükçekmece Spor', 'away', 'played', 2, 0, 'W', 10),

  -- Hafta 11: 29 Kasım 2025 - Ev - İstanbul Beylikdüzüspor (1-2 Mağlubiyet)
  (gen_random_uuid(), '2025-11-29', '2025-2026', 'U16', 'İstanbul Beylikdüzüspor', 'home', 'played', 1, 2, 'L', 11),

  -- Hafta 12: 6 Aralık 2025 - Deplasman - Zara Ekinlispor (6-0 Galibiyet)
  (gen_random_uuid(), '2025-12-06', '2025-2026', 'U16', 'Zara Ekinlispor', 'away', 'played', 6, 0, 'W', 12),

  -- Hafta 13: 13 Aralık 2025 - Ev - Feriköy (1-3 Mağlubiyet)
  (gen_random_uuid(), '2025-12-13', '2025-2026', 'U16', 'Feriköy', 'home', 'played', 1, 3, 'L', 13),

  -- ===== 2. YARI =====

  -- Hafta 14: 10 Ocak 2026 - Deplasman - Tunç Spor (0-4 Mağlubiyet)
  (gen_random_uuid(), '2026-01-10', '2025-2026', 'U16', 'Tunç Spor', 'away', 'played', 0, 4, 'L', 14),

  -- Hafta 15: 17 Ocak 2026 - Ev - İstanbul Gençlerbirliği (3-0 Galibiyet)
  (gen_random_uuid(), '2026-01-17', '2025-2026', 'U16', 'İstanbul Gençlerbirliği', 'home', 'played', 3, 0, 'W', 15),

  -- Hafta 16: 24 Ocak 2026 - Deplasman - Güngören Belediyesi (2-3 Mağlubiyet)
  (gen_random_uuid(), '2026-01-24', '2025-2026', 'U16', 'Güngören Belediyesi', 'away', 'played', 2, 3, 'L', 16),

  -- Hafta 17: 31 Ocak 2026 - Ev - Küçükçekmece Sinop (4-1 Galibiyet)
  (gen_random_uuid(), '2026-01-31', '2025-2026', 'U16', 'Küçükçekmece Sinop', 'home', 'played', 4, 1, 'W', 17),

  -- Hafta 18: 7 Şubat 2026 - Deplasman - Arnavutköy (1-2 Mağlubiyet)
  (gen_random_uuid(), '2026-02-07', '2025-2026', 'U16', 'Arnavutköy', 'away', 'played', 1, 2, 'L', 18);

-- =============================================
-- ÖZET: 18 Maç
--   Galibiyet : 10 (Tunç Spor, İst.Gençlerbirliği, K.Sinop, Başakşehirspor, Ayazağaspor, Kavacık, K.Spor, Zara Ekinlispor, İst.Gençlerbirliği(2), K.Sinop(2))
--   Beraberlik: 2 (Güngören Bel., İnkılap Spor)
--   Mağlubiyet: 6 (Arnavutköy, İst.Beylikdüzüspor, Feriköy, Tunç Spor(2), Güngören Bel.(2), Arnavutköy(2))
--   Atılan gol: 51 | Yenilen gol: 25
-- =============================================
