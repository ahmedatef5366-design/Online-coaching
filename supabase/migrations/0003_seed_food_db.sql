-- =============================================================================
-- Seed: starter food database
-- =============================================================================
-- A small set of staple foods so the flexible-nutrition tracker is usable
-- out of the box. Admins can extend this from the dashboard later.
-- -----------------------------------------------------------------------------

insert into public.food_database (name, name_ar, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
values
  ('Egg (whole)',          'بيض كامل',           155,  13.0,  1.1, 11.0),
  ('Egg white',            'بياض البيض',          52,  10.9,  0.7,  0.2),
  ('Chicken breast (raw)', 'صدر دجاج',           120,  23.0,  0.0,  2.6),
  ('Beef mince 90/10',     'لحم مفروم 90/10',    176,  20.0,  0.0, 10.0),
  ('Salmon fillet',        'سلمون',              208,  20.4,  0.0, 13.4),
  ('White rice (cooked)',  'أرز أبيض مطبوخ',     130,   2.7, 28.2,  0.3),
  ('Brown rice (cooked)',  'أرز بني مطبوخ',      112,   2.6, 23.5,  0.9),
  ('Oats (dry)',           'شوفان',              389,  16.9, 66.3,  6.9),
  ('Sweet potato (raw)',   'بطاطا حلوة',          86,   1.6, 20.1,  0.1),
  ('Potato (raw)',         'بطاطس',               77,   2.0, 17.5,  0.1),
  ('Banana',               'موز',                 89,   1.1, 22.8,  0.3),
  ('Apple',                'تفاح',                52,   0.3, 13.8,  0.2),
  ('Almonds',              'لوز',                579,  21.2, 21.7, 49.9),
  ('Olive oil',            'زيت زيتون',          884,   0.0,  0.0,100.0),
  ('Greek yogurt 2%',      'زبادي يوناني',        73,  10.0,  3.6,  1.9),
  ('Milk 2%',              'حليب 2٪',             50,   3.3,  4.9,  2.0),
  ('Tuna in water',        'تونة بالماء',        116,  25.5,  0.0,  0.8),
  ('Whey protein (scoop)', 'بروتين واي',         400,  80.0,  8.0,  6.0),
  ('Cheese, white',        'جبن أبيض',           264,  18.0,  2.0, 21.0),
  ('Bread, whole wheat',   'خبز قمح كامل',       247,  13.0, 41.0,  4.2),
  ('Hummus',               'حمص',                166,   7.9, 14.3,  9.6),
  ('Foul (cooked)',        'فول مدمس',           130,   8.5, 19.5,  3.0)
on conflict (name) do nothing;
