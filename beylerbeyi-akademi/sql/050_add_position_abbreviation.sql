-- lookup_positions tablosuna abbreviation kolonu ekle
ALTER TABLE public.lookup_positions
  ADD COLUMN IF NOT EXISTS abbreviation TEXT;

-- Mevcut pozisyonlar için kısaltmaları güncelle
UPDATE public.lookup_positions SET abbreviation = 'KL'  WHERE value = 'Kaleci';
UPDATE public.lookup_positions SET abbreviation = 'STP' WHERE value = 'Stoper';
UPDATE public.lookup_positions SET abbreviation = 'SLB' WHERE value = 'Sol Bek';
UPDATE public.lookup_positions SET abbreviation = 'SĞB' WHERE value = 'Sağ Bek';
UPDATE public.lookup_positions SET abbreviation = 'DF'  WHERE value = 'Defans';
UPDATE public.lookup_positions SET abbreviation = 'DO'  WHERE value = 'Defansif Orta Saha';
UPDATE public.lookup_positions SET abbreviation = 'OS'  WHERE value = 'Orta Saha';
UPDATE public.lookup_positions SET abbreviation = 'KNT' WHERE value = 'Kanat Forvet';
UPDATE public.lookup_positions SET abbreviation = 'FV'  WHERE value = 'Forvet';
UPDATE public.lookup_positions SET abbreviation = 'SNT' WHERE value = 'Santrafor';
