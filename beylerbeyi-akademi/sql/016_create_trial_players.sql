-- =============================================
-- Migration: 016_create_trial_players
-- Beylerbeyi Akademi - Deneme Oyuncuları Tablosu
-- =============================================

-- 1) Tablo
CREATE TABLE public.trial_players (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  birth_date       DATE NOT NULL,
  current_team     TEXT,                        -- Bulunduğu takım
  position         TEXT,                        -- Mevkisi
  reference_person TEXT,                        -- Referans olan kişi
  recorded_by      TEXT,                        -- Kayıt alan kişi
  notes            TEXT,                        -- Özel not
  trial_age_group  TEXT,                        -- Hangi yaş grubu ile denemeye çıktığı
  trial_date       DATE,                        -- Denemeye çıkış tarihi
  status           TEXT DEFAULT 'beklemede'     -- Durum bilgisi
                   CHECK (status IN ('olumlu', 'olumsuz', 'beklemede')),
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2) İndeksler
CREATE INDEX idx_trial_players_name      ON public.trial_players(last_name, first_name);
CREATE INDEX idx_trial_players_age_group ON public.trial_players(trial_age_group);
CREATE INDEX idx_trial_players_status    ON public.trial_players(status);
CREATE INDEX idx_trial_players_date      ON public.trial_players(trial_date);

-- 3) Updated_at trigger (handle_updated_at fonksiyonu 003'te oluşturuldu)
CREATE TRIGGER set_trial_players_updated_at
  BEFORE UPDATE ON public.trial_players
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4) RLS
ALTER TABLE public.trial_players ENABLE ROW LEVEL SECURITY;

-- Giriş yapmış tüm kullanıcılar tam erişime sahip
CREATE POLICY "Authenticated users full access on trial players"
  ON public.trial_players
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
