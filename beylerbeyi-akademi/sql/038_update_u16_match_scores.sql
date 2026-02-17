-- =============================================
-- Migration: 038_update_u16_match_scores.sql
-- Beylerbeyi Akademi – U16 Maç Sonuçlarını Güncelle (2025-2026 Sezonu)
-- Mevcut kayıtlardaki skorları, E/D ve sonuçları düzeltir.
-- =============================================

-- Hafta 1: Tunç Spor - E - 7-0 G
UPDATE matches SET score_home = 7, score_away = 0, result = 'W', home_away = 'home'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 1;

-- Hafta 2: İstanbul Gençlerbirliği - D - 3-1 G
UPDATE matches SET score_home = 3, score_away = 1, result = 'W', home_away = 'away'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 2;

-- Hafta 3: Güngören Belediyesi - E - 2-2 B
UPDATE matches SET score_home = 2, score_away = 2, result = 'D', home_away = 'home'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 3;

-- Hafta 4: Küçükçekmece Sinop - D - 1-0 G
UPDATE matches SET score_home = 1, score_away = 0, result = 'W', home_away = 'away'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 4;

-- Hafta 5: Arnavutköy - E - 0-2 M
UPDATE matches SET score_home = 0, score_away = 2, result = 'L', home_away = 'home'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 5;

-- Hafta 6: Başakşehirspor - D - 4-1 G
UPDATE matches SET score_home = 4, score_away = 1, result = 'W', home_away = 'away'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 6;

-- Hafta 7: Ayazağaspor - E - 4-2 G
UPDATE matches SET score_home = 4, score_away = 2, result = 'W', home_away = 'home'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 7;

-- Hafta 8: İnkılap Spor - D - 2-2 B
UPDATE matches SET score_home = 2, score_away = 2, result = 'D', home_away = 'away'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 8;

-- Hafta 9: Kavacık - E - 8-0 G
UPDATE matches SET score_home = 8, score_away = 0, result = 'W', home_away = 'home'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 9;

-- Hafta 10: Küçükçekmece Spor - D - 2-0 G
UPDATE matches SET score_home = 2, score_away = 0, result = 'W', home_away = 'away'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 10;

-- Hafta 11: İstanbul Beylikdüzüspor - E - 1-2 M
UPDATE matches SET score_home = 1, score_away = 2, result = 'L', home_away = 'home'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 11;

-- Hafta 12: Zara Ekinlispor - D - 6-0 G
UPDATE matches SET score_home = 6, score_away = 0, result = 'W', home_away = 'away'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 12;

-- Hafta 13: Feriköy - E - 1-3 M
UPDATE matches SET score_home = 1, score_away = 3, result = 'L', home_away = 'home'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 13;

-- Hafta 14: Tunç Spor - D - 0-4 M
UPDATE matches SET score_home = 0, score_away = 4, result = 'L', home_away = 'away'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 14;

-- Hafta 15: İstanbul Gençlerbirliği - E - 3-0 G
UPDATE matches SET score_home = 3, score_away = 0, result = 'W', home_away = 'home'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 15;

-- Hafta 16: Güngören Belediyesi - D - 2-3 M
UPDATE matches SET score_home = 2, score_away = 3, result = 'L', home_away = 'away'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 16;

-- Hafta 17: Küçükçekmece Sinop - E - 4-1 G
UPDATE matches SET score_home = 4, score_away = 1, result = 'W', home_away = 'home'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 17;

-- Hafta 18: Arnavutköy - D - 1-2 M
UPDATE matches SET score_home = 1, score_away = 2, result = 'L', home_away = 'away'
WHERE age_group = 'U16' AND season = '2025-2026' AND week = 18;

-- =============================================
-- Doğrulama: Güncellenen kayıtları kontrol et
-- =============================================
SELECT week, opponent, home_away, score_home, score_away, result
FROM matches
WHERE age_group = 'U16' AND season = '2025-2026'
ORDER BY week;
