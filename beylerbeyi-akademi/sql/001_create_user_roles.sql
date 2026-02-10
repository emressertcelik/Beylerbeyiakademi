-- =============================================
-- Migration: 001_create_user_roles
-- Beylerbeyi Akademi - Kullanıcı Rolleri Tablosu
-- =============================================

-- 1) Kullanıcı rolleri enum tipi
CREATE TYPE user_role AS ENUM ('oyuncu', 'antrenor', 'yonetici');

-- 2) user_roles tablosu
--    auth.users tablosuna foreign key ile bağlı
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'oyuncu',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3) Index: user_id üzerinden hızlı sorgulama
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- 4) RLS (Row Level Security) aktif et
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5) RLS Politikaları

-- Herkes kendi rolünü okuyabilir
CREATE POLICY "Users can view their own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Yönetici tüm rolleri görebilir
CREATE POLICY "Yoneticiler can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'yonetici'
    )
  );

-- Yönetici rolleri güncelleyebilir
CREATE POLICY "Yoneticiler can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'yonetici'
    )
  );

-- Yönetici yeni rol atayabilir
CREATE POLICY "Yoneticiler can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'yonetici'
    )
  );

-- Yönetici rolleri silebilir
CREATE POLICY "Yoneticiler can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'yonetici'
    )
  );

-- 6) Yeni kayıt olan kullanıcıya otomatik 'oyuncu' rolü ata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'oyuncu');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7) updated_at alanını otomatik güncelle
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
