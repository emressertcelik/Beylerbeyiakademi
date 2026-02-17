-- =============================================
-- Rollback: 034a_rollback_u19_goals_cards.sql
-- U19 maçlarındaki gol, asist, sarı kart, kırmızı kart değerlerini sıfırlar
-- 034_update_u19_goals_cards.sql yanlış çalıştıysa bunu çalıştırın
-- Sonra 034'ü tekrar çalıştırabilirsiniz
-- =============================================

UPDATE match_player_stats
SET
  goals        = 0,
  assists      = 0,
  yellow_cards = 0,
  red_cards    = 0
WHERE match_id IN (
  SELECT id FROM matches WHERE age_group = 'U19'
);

-- Kontrol
SELECT
  ps.player_name,
  m.date,
  ps.goals,
  ps.assists,
  ps.yellow_cards,
  ps.red_cards
FROM match_player_stats ps
JOIN matches m ON m.id = ps.match_id
WHERE m.age_group = 'U19'
  AND (ps.goals > 0 OR ps.assists > 0 OR ps.yellow_cards > 0 OR ps.red_cards > 0)
ORDER BY m.date, ps.player_name;
