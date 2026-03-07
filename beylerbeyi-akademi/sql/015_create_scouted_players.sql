-- =============================================
-- Migration: 015_create_scouted_players
-- Beylerbeyi Akademi - İzlenen Oyuncular Tablosu
-- =============================================

-- 1) Tablo
CREATE TABLE public.scouted_players (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  birth_date       DATE NOT NULL,
  current_team     TEXT,           -- Bulunduğu takım
  position         TEXT,           -- Mevkisi
  reference_person TEXT,           -- Referans olan kişi
  recorded_by      TEXT,           -- Kayıt alan kişi
  notes            TEXT,           -- Özel not
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2) İndeksler
CREATE INDEX idx_scouted_players_name     ON public.scouted_players(last_name, first_name);
CREATE INDEX idx_scouted_players_position ON public.scouted_players(position);

-- 3) Updated_at trigger (handle_updated_at fonksiyonu 003'te oluşturuldu)
CREATE TRIGGER set_scouted_players_updated_at
  BEFORE UPDATE ON public.scouted_players
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4) RLS
ALTER TABLE public.scouted_players ENABLE ROW LEVEL SECURITY;

-- Giriş yapmış tüm kullanıcılar tam erişime sahip
CREATE POLICY "Authenticated users full access on scouted players"
  ON public.scouted_players
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
