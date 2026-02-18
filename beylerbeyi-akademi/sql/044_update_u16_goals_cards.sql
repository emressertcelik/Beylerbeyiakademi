-- =============================================
-- Migration: 044_update_u16_goals_cards.sql
-- Beylerbeyi Akademi – U16 Oyuncu Maç İstatistikleri (Gol, Sarı Kart, Kırmızı Kart)
-- Mevcut match_player_stats kayıtlarını günceller
-- =============================================

DO $$
DECLARE
  rec RECORD;
  v_match_id uuid;
  v_player_id uuid;
  v_updated int := 0;
  v_skipped int := 0;
BEGIN

  CREATE TEMP TABLE tmp_u16_cards_goals (
    first_name text,
    last_name  text,
    match_date date,
    goals      smallint DEFAULT 0,
    assists    smallint DEFAULT 0,
    yellow_cards smallint DEFAULT 0,
    red_cards  smallint DEFAULT 0
  ) ON COMMIT DROP;

  INSERT INTO tmp_u16_cards_goals (first_name, last_name, match_date, goals, assists, yellow_cards, red_cards) VALUES

  -- ============ GOL ============

  -- 4) Güney Kakiz
  ('Güney','Kakiz','2025-09-20', 1, 0, 0, 0),

  -- 11) Hasan Kerem Turan
  ('Hasan Kerem','Turan','2025-10-04', 1, 0, 0, 0),

  -- 12) Bedreddin İlkcan Eren
  ('Bedreddin İlkcan','Eren','2025-09-20', 5, 0, 0, 0),
  ('Bedreddin İlkcan','Eren','2025-11-15', 1, 0, 0, 0),
  ('Bedreddin İlkcan','Eren','2025-11-22', 1, 0, 0, 0),
  ('Bedreddin İlkcan','Eren','2025-12-06', 1, 0, 0, 0),

  -- 14) Abdul Batın Kaçar
  ('Abdul Batın','Kaçar','2025-10-04', 1, 0, 0, 0),
  ('Abdul Batın','Kaçar','2025-11-01', 1, 0, 0, 0),
  ('Abdul Batın','Kaçar','2025-11-08', 2, 0, 0, 0),
  ('Abdul Batın','Kaçar','2025-11-15', 2, 0, 0, 0),
  ('Abdul Batın','Kaçar','2025-11-29', 1, 0, 0, 0),
  ('Abdul Batın','Kaçar','2025-12-06', 1, 0, 0, 0),
  ('Abdul Batın','Kaçar','2026-01-24', 1, 0, 0, 0),
  ('Abdul Batın','Kaçar','2026-01-31', 1, 0, 0, 0),
  ('Abdul Batın','Kaçar','2026-02-14', 1, 0, 0, 0),

  -- 17) Yağız Akarsu
  ('Yağız','Akarsu','2025-10-25', 1, 0, 0, 0),
  ('Yağız','Akarsu','2025-11-01', 1, 0, 0, 0),
  ('Yağız','Akarsu','2025-11-15', 1, 0, 0, 0),
  ('Yağız','Akarsu','2025-12-13', 1, 0, 0, 0),
  ('Yağız','Akarsu','2026-01-24', 2, 0, 0, 0),
  ('Yağız','Akarsu','2026-01-31', 1, 0, 0, 0),

  -- 18) Burak Sevindik
  ('Burak','Sevindik','2025-09-27', 2, 0, 0, 0),
  ('Burak','Sevindik','2025-11-01', 1, 0, 0, 0),

  -- 19) Utku Uysal
  ('Utku','Uysal','2025-11-15', 1, 0, 0, 0),
  ('Utku','Uysal','2025-11-22', 1, 0, 0, 0),
  ('Utku','Uysal','2025-12-06', 3, 0, 0, 0),
  ('Utku','Uysal','2026-02-14', 1, 0, 0, 0),

  -- 20) Poyraz Soğancıoğlu
  ('Poyraz','Soğancıoğlu','2025-09-20', 1, 0, 0, 0),
  ('Poyraz','Soğancıoğlu','2025-09-27', 1, 0, 0, 0),
  ('Poyraz','Soğancıoğlu','2025-10-11', 1, 0, 0, 0),
  ('Poyraz','Soğancıoğlu','2025-10-25', 1, 0, 0, 0),
  ('Poyraz','Soğancıoğlu','2025-11-01', 2, 0, 0, 0),
  ('Poyraz','Soğancıoğlu','2025-11-15', 2, 0, 0, 0),
  ('Poyraz','Soğancıoğlu','2025-12-06', 1, 0, 0, 0),
  ('Poyraz','Soğancıoğlu','2026-01-24', 1, 0, 0, 0),
  ('Poyraz','Soğancıoğlu','2026-01-31', 2, 0, 0, 0),
  ('Poyraz','Soğancıoğlu','2026-02-07', 1, 0, 0, 0),
  ('Poyraz','Soğancıoğlu','2026-02-14', 1, 0, 0, 0),

  -- 22) Alperen Taş
  ('Alperen','Taş','2025-11-15', 1, 0, 0, 0),
  ('Alperen','Taş','2025-12-06', 1, 0, 0, 0),

  -- ============ SARI KART (SK) ============

  -- 4) Güney Kakiz
  ('Güney','Kakiz','2025-10-18', 0, 0, 1, 0),
  ('Güney','Kakiz','2025-11-01', 0, 0, 1, 0),
  ('Güney','Kakiz','2026-01-24', 0, 0, 1, 0),

  -- 5) Mehmet Kuranç
  ('Mehmet','Kuranç','2025-11-01', 0, 0, 1, 0),

  -- 8) Mert Ali Günay
  ('Mert Ali','Günay','2025-10-18', 0, 0, 1, 0),
  ('Mert Ali','Günay','2025-11-29', 0, 0, 1, 0),
  ('Mert Ali','Günay','2026-01-24', 0, 0, 1, 0),
  ('Mert Ali','Günay','2026-01-31', 0, 0, 1, 0),

  -- 11) Hasan Kerem Turan
  ('Hasan Kerem','Turan','2025-10-11', 0, 0, 1, 0),

  -- 18) Burak Sevindik
  ('Burak','Sevindik','2025-10-11', 0, 0, 1, 0),

  -- 23) Ahmet Kayra Okçuoğlu
  ('Ahmet Kayra','Okçuoğlu','2025-12-13', 0, 0, 1, 0),

  -- ============ KIRMIZI KART (KK) ============

  -- 1) Vedat Efe Ercan
  ('Vedat Efe','Ercan','2025-12-13', 0, 0, 0, 1),

  -- 22) Alperen Taş
  ('Alperen','Taş','2026-02-14', 0, 0, 0, 1);

  -- ===== UPDATE İşlemi =====
  FOR rec IN SELECT * FROM tmp_u16_cards_goals
  LOOP
    -- Oyuncuyu bul
    SELECT id INTO v_player_id
    FROM players
    WHERE first_name = rec.first_name AND last_name = rec.last_name
    LIMIT 1;

    -- Maçı bul
    SELECT id INTO v_match_id
    FROM matches
    WHERE date = rec.match_date AND age_group = 'U16'
    LIMIT 1;

    IF v_player_id IS NOT NULL AND v_match_id IS NOT NULL THEN
      UPDATE match_player_stats
      SET
        goals        = goals        + rec.goals,
        assists      = assists      + rec.assists,
        yellow_cards = yellow_cards + rec.yellow_cards,
        red_cards    = red_cards    + rec.red_cards
      WHERE match_id = v_match_id
        AND player_id = v_player_id;

      IF FOUND THEN
        v_updated := v_updated + 1;
      ELSE
        RAISE NOTICE 'Kayıt bulunamadı: % % – %', rec.first_name, rec.last_name, rec.match_date;
        v_skipped := v_skipped + 1;
      END IF;
    ELSE
      RAISE NOTICE 'Oyuncu/maç bulunamadı: % % – %', rec.first_name, rec.last_name, rec.match_date;
      v_skipped := v_skipped + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'U16 gol/kart güncelleme tamamlandı. Güncellenen: %, Atlanan: %', v_updated, v_skipped;
END $$;
