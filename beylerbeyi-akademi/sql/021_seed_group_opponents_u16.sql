-- 021_seed_group_opponents_u16.sql
-- Beylerbeyi hariç listedeki takımları U16 grup 4 olarak ekler
INSERT INTO group_opponents (season, age_group, group_number, opponent)
VALUES
  ('2025-2026', 'U16', 4, 'Arnavutköy '),
  ('2025-2026', 'U16', 4, 'Ayazağaspor'),
  ('2025-2026', 'U16', 4, 'Feriköy'),
  ('2025-2026', 'U16', 4, 'Küçükçekmece Sinop'),
  ('2025-2026', 'U16', 4, 'Tunç Spor'),
  ('2025-2026', 'U16', 4, 'Güngören Belediyesi'),
  ('2025-2026', 'U16', 4, 'İnkılap Spor'),
  ('2025-2026', 'U16', 4, 'Küçükçekmece Spor'),
  ('2025-2026', 'U16', 4, 'İstanbul Beylikdüzüspor'),
  ('2025-2026', 'U16', 4, 'Başakşehirspor'),
  ('2025-2026', 'U16', 4, 'İstanbul Gençlerbirliği'),
  ('2025-2026', 'U16', 4, 'Zara Ekinlispor'),
  ('2025-2026', 'U16', 4, 'Kavacık');
