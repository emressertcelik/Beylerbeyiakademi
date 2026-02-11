-- 011: U15 yaş grubu için 20 örnek oyuncu
-- Not: player_tactical_skills ve player_athletic_skills trigger ile otomatik oluşturulur

INSERT INTO players (first_name, last_name, birth_date, age_group, position, foot, jersey_number, height, weight, seasons, phone, parent_phone, notes)
VALUES
  ('Arda',     'Yılmaz',    '2011-03-15', 'U15', 'Kaleci',             'Sağ',  1,  172, 62, '{"2025-2026"}', NULL, '05321234501', 'Refleksleri çok iyi'),
  ('Berat',    'Kaya',      '2011-07-22', 'U15', 'Sağ Bek',            'Sağ',  2,  165, 55, '{"2025-2026"}', NULL, '05321234502', NULL),
  ('Emirhan',  'Demir',     '2011-01-10', 'U15', 'Stoper',             'Sağ',  3,  174, 65, '{"2025-2026"}', NULL, '05321234503', 'Kaptan adayı'),
  ('Yusuf',    'Çelik',     '2011-05-18', 'U15', 'Stoper',             'Sol',  4,  175, 66, '{"2025-2026"}', NULL, '05321234504', NULL),
  ('Kerem',    'Arslan',    '2011-09-03', 'U15', 'Sol Bek',            'Sol',  5,  166, 56, '{"2025-2026"}', NULL, '05321234505', 'Hızlı çıkışları var'),
  ('Baran',    'Şahin',     '2011-11-25', 'U15', 'Defansif Orta Saha', 'Sağ',  6,  170, 60, '{"2025-2026"}', NULL, '05321234506', NULL),
  ('Alperen',  'Öztürk',    '2011-04-12', 'U15', 'Orta Saha',          'Sağ',  7,  168, 58, '{"2025-2026"}', NULL, '05321234507', 'Oyun kurma yeteneği iyi'),
  ('Doruk',    'Aydın',     '2011-08-30', 'U15', 'Orta Saha',          'Sağ',  8,  169, 59, '{"2025-2026"}', NULL, '05321234508', NULL),
  ('Çınar',    'Koç',       '2011-02-14', 'U15', 'Ofansif Orta Saha',  'Sol',  10, 167, 57, '{"2025-2026"}', NULL, '05321234509', '10 numara, vizyonu geniş'),
  ('Efe',      'Yıldırım',  '2011-06-08', 'U15', 'Sağ Kanat',         'Sağ',  11, 164, 54, '{"2025-2026"}', NULL, '05321234510', 'Hızlı ve dribling iyi'),
  ('Mert',     'Erdoğan',   '2011-10-19', 'U15', 'Sol Kanat',         'Sol',  17, 163, 53, '{"2025-2026"}', NULL, '05321234511', NULL),
  ('Kaan',     'Aktaş',     '2011-12-05', 'U15', 'Forvet',            'Sağ',  9,  170, 61, '{"2025-2026"}', NULL, '05321234512', 'Gol içgüdüsü kuvvetli'),
  ('Deniz',    'Korkmaz',   '2011-03-28', 'U15', 'Forvet',            'Sol',  19, 168, 59, '{"2025-2026"}', NULL, '05321234513', NULL),
  ('Burak',    'Özdemir',   '2012-01-07', 'U15', 'Kaleci',            'Sağ',  12, 170, 60, '{"2025-2026"}', NULL, '05321234514', 'Yedek kaleci'),
  ('Umut',     'Polat',     '2011-07-16', 'U15', 'Sağ Bek',           'Sağ',  22, 164, 55, '{"2025-2026"}', NULL, '05321234515', NULL),
  ('Batuhan',  'Güneş',     '2011-04-25', 'U15', 'Stoper',            'Sağ',  14, 173, 64, '{"2025-2026"}', NULL, '05321234516', 'Hava toplarında iyi'),
  ('Emir',     'Çetin',     '2011-09-11', 'U15', 'Orta Saha',         'Sağ',  16, 166, 57, '{"2025-2026"}', NULL, '05321234517', NULL),
  ('Oğuzhan',  'Tunç',      '2011-11-02', 'U15', 'Ofansif Orta Saha', 'Sağ',  20, 165, 56, '{"2025-2026"}', NULL, '05321234518', 'Serbest vuruşlarda etkili'),
  ('Can',      'Başaran',   '2011-06-20', 'U15', 'Sağ Kanat',         'Sağ',  23, 162, 52, '{"2025-2026"}', NULL, '05321234519', NULL),
  ('Toprak',   'Kurt',      '2011-08-14', 'U15', 'Forvet',            'Sağ',  18, 171, 62, '{"2025-2026"}', NULL, '05321234520', 'Fiziksel olarak güçlü');
