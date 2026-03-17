-- Seed default routes for La Promesse Logistiques
-- Canada → Afrique de l'Ouest (Air + Maritime)
-- Prices in CAD per kg

INSERT INTO routes (name, origin, destination, direction, transport, duration_days, base_price, price_per_kg, is_active)
VALUES
  -- ── Burkina Faso ──────────────────────────────────────────
  ('Montréal → Ouagadougou · Aérien',
   'Montréal, Canada', 'Ouagadougou, Burkina Faso',
   'CA_TO_BF', 'AIR', 7, 25, 8, true),

  ('Montréal → Ouagadougou · Maritime',
   'Montréal, Canada', 'Ouagadougou, Burkina Faso',
   'CA_TO_BF', 'SEA', 42, 15, 4, true),

  -- ── Mali ──────────────────────────────────────────────────
  ('Montréal → Bamako · Aérien',
   'Montréal, Canada', 'Bamako, Mali',
   'CA_TO_BF', 'AIR', 8, 25, 8, true),

  ('Montréal → Bamako · Maritime',
   'Montréal, Canada', 'Bamako, Mali',
   'CA_TO_BF', 'SEA', 44, 15, 4, true),

  -- ── Sénégal ───────────────────────────────────────────────
  ('Montréal → Dakar · Aérien',
   'Montréal, Canada', 'Dakar, Sénégal',
   'CA_TO_BF', 'AIR', 6, 25, 8, true),

  ('Montréal → Dakar · Maritime',
   'Montréal, Canada', 'Dakar, Sénégal',
   'CA_TO_BF', 'SEA', 36, 15, 4, true),

  -- ── Côte d'Ivoire ─────────────────────────────────────────
  ('Montréal → Abidjan · Aérien',
   'Montréal, Canada', 'Abidjan, Côte d''Ivoire',
   'CA_TO_BF', 'AIR', 7, 25, 8, true),

  ('Montréal → Abidjan · Maritime',
   'Montréal, Canada', 'Abidjan, Côte d''Ivoire',
   'CA_TO_BF', 'SEA', 38, 15, 4, true),

  -- ── Retours : Afrique → Canada (aérien seulement) ─────────
  ('Ouagadougou → Montréal · Aérien',
   'Ouagadougou, Burkina Faso', 'Montréal, Canada',
   'BF_TO_CA', 'AIR', 8, 30, 10, true),

  ('Bamako → Montréal · Aérien',
   'Bamako, Mali', 'Montréal, Canada',
   'BF_TO_CA', 'AIR', 9, 30, 10, true),

  ('Dakar → Montréal · Aérien',
   'Dakar, Sénégal', 'Montréal, Canada',
   'BF_TO_CA', 'AIR', 7, 30, 10, true),

  ('Abidjan → Montréal · Aérien',
   'Abidjan, Côte d''Ivoire', 'Montréal, Canada',
   'BF_TO_CA', 'AIR', 8, 30, 10, true)

ON CONFLICT DO NOTHING;
