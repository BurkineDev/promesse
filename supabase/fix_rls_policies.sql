-- ================================================================
-- CORRECTIF : Remplace auth_user_role() inexistant dans Supabase
-- Coller et exécuter dans l'éditeur SQL de Supabase
-- ================================================================

-- ── 1. Nouvelles tables (si pas encore créées) ─────────────────

-- Table ROUTES
CREATE TABLE IF NOT EXISTS routes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  origin       TEXT NOT NULL,
  destination  TEXT NOT NULL,
  direction    TEXT NOT NULL CHECK (direction IN ('CA_TO_BF', 'BF_TO_CA')),
  transport    TEXT NOT NULL DEFAULT 'AIR' CHECK (transport IN ('AIR', 'SEA', 'LAND')),
  duration_days INT,
  base_price   DECIMAL(10,2) DEFAULT 0,
  price_per_kg DECIMAL(10,2) DEFAULT 3.00,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table SHIPMENTS
CREATE TABLE IF NOT EXISTS shipments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  route_id       UUID REFERENCES routes(id) ON DELETE SET NULL,
  direction      TEXT NOT NULL CHECK (direction IN ('CA_TO_BF', 'BF_TO_CA')),
  transport      TEXT NOT NULL DEFAULT 'AIR' CHECK (transport IN ('AIR', 'SEA', 'LAND')),
  departure_date DATE,
  arrival_date   DATE,
  status         TEXT NOT NULL DEFAULT 'PLANIFIE'
    CHECK (status IN ('PLANIFIE', 'EN_COURS', 'ARRIVE', 'FERME')),
  notes          TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table INCIDENTS
CREATE TABLE IF NOT EXISTS incidents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id  UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN (
    'COLIS_ENDOMMAGE','COLIS_PERDU','BLOQUE_DOUANE',
    'INFORMATIONS_INCOMPLETES','RETARD','NON_RECUPERE','AUTRE'
  )),
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'OUVERT'
    CHECK (status IN ('OUVERT','EN_TRAITEMENT','RESOLU','FERME')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 2. Colonnes supplémentaires sur packages ───────────────────
ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS category        TEXT DEFAULT 'DIVERS',
  ADD COLUMN IF NOT EXISTS length_cm       DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS width_cm        DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS height_cm       DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS declared_value  DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS is_urgent       BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS direction       TEXT DEFAULT 'CA_TO_BF'
    CHECK (direction IN ('CA_TO_BF','BF_TO_CA')),
  ADD COLUMN IF NOT EXISTS assigned_agent  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shipment_id     UUID,
  ADD COLUMN IF NOT EXISTS submitted_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS estimated_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS qr_code_url     TEXT;

-- FK shipment_id (ignore si déjà présente)
ALTER TABLE packages
  ADD CONSTRAINT fk_packages_shipment
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE SET NULL;

-- Colonnes profils
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone              TEXT,
  ADD COLUMN IF NOT EXISTS push_token         TEXT,
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{"email":true,"push":true}',
  ADD COLUMN IF NOT EXISTS avatar_url         TEXT;

-- ── 3. Contrainte statut packages ─────────────────────────────
ALTER TABLE packages DROP CONSTRAINT IF EXISTS packages_status_check;
ALTER TABLE packages ADD CONSTRAINT packages_status_check CHECK (status IN (
  'SOUMIS','EN_ATTENTE_VALIDATION','RECU','ENTREPOT',
  'EN_PREPARATION','PRET_DEPART','EXPEDIE','EN_TRANSIT',
  'EN_COURS_LIVRAISON','ARRIVE','LIVRE','INCIDENT','ANNULE'
));

ALTER TABLE tracking_events DROP CONSTRAINT IF EXISTS tracking_events_status_check;
ALTER TABLE tracking_events ADD CONSTRAINT tracking_events_status_check CHECK (status IN (
  'SOUMIS','EN_ATTENTE_VALIDATION','RECU','ENTREPOT',
  'EN_PREPARATION','PRET_DEPART','EXPEDIE','EN_TRANSIT',
  'EN_COURS_LIVRAISON','ARRIVE','LIVRE','INCIDENT','ANNULE'
));

-- ── 4. Triggers updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shipments_updated_at ON shipments;
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents;
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 5. RLS (avec la bonne syntaxe Supabase) ───────────────────
ALTER TABLE routes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "routes_select"  ON routes;
DROP POLICY IF EXISTS "routes_insert"  ON routes;
DROP POLICY IF EXISTS "routes_update"  ON routes;
DROP POLICY IF EXISTS "routes_delete"  ON routes;
DROP POLICY IF EXISTS "shipments_select" ON shipments;
DROP POLICY IF EXISTS "shipments_insert" ON shipments;
DROP POLICY IF EXISTS "shipments_update" ON shipments;
DROP POLICY IF EXISTS "incidents_select" ON incidents;
DROP POLICY IF EXISTS "incidents_insert" ON incidents;
DROP POLICY IF EXISTS "incidents_update" ON incidents;
DROP POLICY IF EXISTS "packages_client_submit" ON packages;
DROP POLICY IF EXISTS "packages_client_select" ON packages;
DROP POLICY IF EXISTS "packages_select_staff"  ON packages;

-- Routes
CREATE POLICY "routes_select" ON routes FOR SELECT USING (true);
CREATE POLICY "routes_insert" ON routes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','agent'))
);
CREATE POLICY "routes_update" ON routes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','agent'))
);
CREATE POLICY "routes_delete" ON routes FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Shipments
CREATE POLICY "shipments_select" ON shipments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','agent'))
);
CREATE POLICY "shipments_insert" ON shipments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','agent'))
);
CREATE POLICY "shipments_update" ON shipments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','agent'))
);

-- Incidents
CREATE POLICY "incidents_select" ON incidents FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','agent'))
);
CREATE POLICY "incidents_insert" ON incidents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','agent'))
);
CREATE POLICY "incidents_update" ON incidents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','agent'))
);

-- Clients peuvent soumettre leurs colis
CREATE POLICY "packages_client_submit" ON packages
  FOR INSERT WITH CHECK (status = 'SOUMIS' AND submitted_by = auth.uid());

-- Clients voient leurs colis, staff voit tout
CREATE POLICY "packages_client_select" ON packages
  FOR SELECT USING (
    submitted_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','agent'))
  );

-- ── 6. Routes de démo ─────────────────────────────────────────
INSERT INTO routes (name, origin, destination, direction, transport, duration_days, base_price, price_per_kg, is_active)
VALUES
  ('Montréal → Ouagadougou · Aérien',  'Montréal, Canada', 'Ouagadougou, Burkina Faso', 'CA_TO_BF', 'AIR', 7,  25, 8, true),
  ('Montréal → Ouagadougou · Maritime','Montréal, Canada', 'Ouagadougou, Burkina Faso', 'CA_TO_BF', 'SEA', 42, 15, 4, true),
  ('Montréal → Bamako · Aérien',       'Montréal, Canada', 'Bamako, Mali',              'CA_TO_BF', 'AIR', 8,  25, 8, true),
  ('Montréal → Bamako · Maritime',     'Montréal, Canada', 'Bamako, Mali',              'CA_TO_BF', 'SEA', 44, 15, 4, true),
  ('Montréal → Dakar · Aérien',        'Montréal, Canada', 'Dakar, Sénégal',            'CA_TO_BF', 'AIR', 6,  25, 8, true),
  ('Montréal → Dakar · Maritime',      'Montréal, Canada', 'Dakar, Sénégal',            'CA_TO_BF', 'SEA', 36, 15, 4, true),
  ('Montréal → Abidjan · Aérien',      'Montréal, Canada', 'Abidjan, Côte d''Ivoire',   'CA_TO_BF', 'AIR', 7,  25, 8, true),
  ('Montréal → Abidjan · Maritime',    'Montréal, Canada', 'Abidjan, Côte d''Ivoire',   'CA_TO_BF', 'SEA', 38, 15, 4, true),
  ('Ouagadougou → Montréal · Aérien',  'Ouagadougou, Burkina Faso', 'Montréal, Canada', 'BF_TO_CA', 'AIR', 8,  30, 10, true),
  ('Bamako → Montréal · Aérien',       'Bamako, Mali',     'Montréal, Canada',          'BF_TO_CA', 'AIR', 9,  30, 10, true),
  ('Dakar → Montréal · Aérien',        'Dakar, Sénégal',   'Montréal, Canada',          'BF_TO_CA', 'AIR', 7,  30, 10, true),
  ('Abidjan → Montréal · Aérien',      'Abidjan, Côte d''Ivoire', 'Montréal, Canada',   'BF_TO_CA', 'AIR', 8,  30, 10, true)
ON CONFLICT DO NOTHING;

-- ── Vérification ──────────────────────────────────────────────
SELECT 'Correctif appliqué avec succès ✓' AS statut,
       COUNT(*) AS routes_disponibles
FROM routes WHERE is_active = true;
