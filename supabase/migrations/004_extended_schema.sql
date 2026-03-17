-- ============================================================
-- PromessTrack — Migration 004 : Schéma étendu v2
-- ============================================================
-- Nouvelles fonctionnalités :
--   • Statuts enrichis (SOUMIS, EN_ATTENTE_VALIDATION, PRET_DEPART,
--     EN_COURS_LIVRAISON, INCIDENT, ANNULE)
--   • Champs colis : catégorie, dimensions, valeur déclarée, urgence,
--     sens du trajet, agent assigné, lot d'expédition
--   • Table routes (trajets récurrents)
--   • Table shipments (lots d'expédition)
--   • Table incidents
--   • Profil client étendu (téléphone, notifications push)
-- ============================================================

-- 1. Mettre à jour la contrainte statut (remplacer l'ancienne)
ALTER TABLE packages
  DROP CONSTRAINT IF EXISTS packages_status_check;

ALTER TABLE packages
  ADD CONSTRAINT packages_status_check CHECK (status IN (
    'SOUMIS',
    'EN_ATTENTE_VALIDATION',
    'RECU',
    'ENTREPOT',
    'PRET_DEPART',
    'EXPEDIE',
    'EN_TRANSIT',
    'EN_COURS_LIVRAISON',
    'ARRIVE',
    'LIVRE',
    'INCIDENT',
    'ANNULE'
  ));

ALTER TABLE tracking_events
  DROP CONSTRAINT IF EXISTS tracking_events_status_check;

ALTER TABLE tracking_events
  ADD CONSTRAINT tracking_events_status_check CHECK (status IN (
    'SOUMIS',
    'EN_ATTENTE_VALIDATION',
    'RECU',
    'ENTREPOT',
    'PRET_DEPART',
    'EXPEDIE',
    'EN_TRANSIT',
    'EN_COURS_LIVRAISON',
    'ARRIVE',
    'LIVRE',
    'INCIDENT',
    'ANNULE'
  ));

-- 2. Nouveaux champs sur packages
ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS category         TEXT DEFAULT 'DIVERS',
  ADD COLUMN IF NOT EXISTS length_cm        DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS width_cm         DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS height_cm        DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS declared_value   DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS is_urgent        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS direction        TEXT DEFAULT 'CA_TO_BF'
    CHECK (direction IN ('CA_TO_BF', 'BF_TO_CA')),
  ADD COLUMN IF NOT EXISTS assigned_agent   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shipment_id      UUID,  -- foreign key ajoutée après la table shipments
  ADD COLUMN IF NOT EXISTS submitted_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS estimated_price  DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS qr_code_url      TEXT;

-- 3. Table ROUTES (trajets récurrents)
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

-- 4. Table SHIPMENTS (lots d'expédition / départs groupés)
CREATE TABLE IF NOT EXISTS shipments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  route_id     UUID REFERENCES routes(id) ON DELETE SET NULL,
  direction    TEXT NOT NULL CHECK (direction IN ('CA_TO_BF', 'BF_TO_CA')),
  transport    TEXT NOT NULL DEFAULT 'AIR' CHECK (transport IN ('AIR', 'SEA', 'LAND')),
  departure_date DATE,
  arrival_date   DATE,
  status       TEXT NOT NULL DEFAULT 'PLANIFIE'
    CHECK (status IN ('PLANIFIE', 'EN_COURS', 'ARRIVE', 'FERME')),
  notes        TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter la FK shipment_id maintenant que la table existe
ALTER TABLE packages
  ADD CONSTRAINT fk_packages_shipment
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE SET NULL;

-- 5. Table INCIDENTS
CREATE TABLE IF NOT EXISTS incidents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id   UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN (
    'COLIS_ENDOMMAGE',
    'COLIS_PERDU',
    'BLOQUE_DOUANE',
    'INFORMATIONS_INCOMPLETES',
    'RETARD',
    'NON_RECUPERE',
    'AUTRE'
  )),
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'OUVERT'
    CHECK (status IN ('OUVERT', 'EN_TRAITEMENT', 'RESOLU', 'FERME')),
  resolved_at  TIMESTAMP WITH TIME ZONE,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enrichir les profils clients
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone             TEXT,
  ADD COLUMN IF NOT EXISTS push_token        TEXT,
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{"email":true,"push":true}',
  ADD COLUMN IF NOT EXISTS avatar_url        TEXT;

-- 7. Trigger updated_at pour nouvelles tables
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 8. RLS pour nouvelles tables
ALTER TABLE routes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Routes : lecture publique, écriture admin/agent
CREATE POLICY "routes_select"  ON routes    FOR SELECT USING (true);
CREATE POLICY "routes_insert"  ON routes    FOR INSERT WITH CHECK (auth_user_role() IN ('admin','agent'));
CREATE POLICY "routes_update"  ON routes    FOR UPDATE USING (auth_user_role() IN ('admin','agent'));
CREATE POLICY "routes_delete"  ON routes    FOR DELETE USING (auth_user_role() = 'admin');

-- Shipments
CREATE POLICY "shipments_select" ON shipments FOR SELECT USING (auth_user_role() IN ('admin','agent'));
CREATE POLICY "shipments_insert" ON shipments FOR INSERT WITH CHECK (auth_user_role() IN ('admin','agent'));
CREATE POLICY "shipments_update" ON shipments FOR UPDATE USING (auth_user_role() IN ('admin','agent'));

-- Incidents
CREATE POLICY "incidents_select" ON incidents FOR SELECT USING (auth_user_role() IN ('admin','agent'));
CREATE POLICY "incidents_insert" ON incidents FOR INSERT WITH CHECK (auth_user_role() IN ('admin','agent'));
CREATE POLICY "incidents_update" ON incidents FOR UPDATE USING (auth_user_role() IN ('admin','agent'));

-- 9. Permettre aux clients de soumettre un colis (SOUMIS)
CREATE POLICY "packages_client_submit" ON packages
  FOR INSERT WITH CHECK (
    status = 'SOUMIS'
    AND submitted_by = auth.uid()
  );

-- 10. Permettre aux clients de voir leurs propres colis
CREATE POLICY "packages_client_select" ON packages
  FOR SELECT USING (
    submitted_by = auth.uid()
    OR auth_user_role() IN ('admin', 'agent')
  );

-- Retirer l'ancienne policy trop restrictive
DROP POLICY IF EXISTS "packages_select_staff" ON packages;

-- 11. Routes de démo
INSERT INTO routes (name, origin, destination, direction, transport, duration_days, base_price, price_per_kg) VALUES
('Montréal → Ouagadougou (Aérien)',  'Montréal, Canada',   'Ouagadougou, Burkina Faso', 'CA_TO_BF', 'AIR',  7,  30.00, 4.50),
('Montréal → Ouagadougou (Maritime)','Montréal, Canada',   'Ouagadougou, Burkina Faso', 'CA_TO_BF', 'SEA',  45, 15.00, 2.00),
('Montréal → Bobo-Dioulasso',        'Montréal, Canada',   'Bobo-Dioulasso, Burkina Faso','CA_TO_BF','AIR', 8,  35.00, 4.50),
('Ouagadougou → Montréal (Aérien)',  'Ouagadougou, Burkina Faso','Montréal, Canada',    'BF_TO_CA', 'AIR',  7,  30.00, 4.50),
('Montréal → Dakar',                 'Montréal, Canada',   'Dakar, Sénégal',           'CA_TO_BF', 'AIR',  5,  25.00, 4.00),
('Montréal → Abidjan',               'Montréal, Canada',   'Abidjan, Côte d''Ivoire',  'CA_TO_BF', 'AIR',  6,  28.00, 4.20),
('Montréal → Bamako',                'Montréal, Canada',   'Bamako, Mali',             'CA_TO_BF', 'AIR',  6,  28.00, 4.20)
ON CONFLICT DO NOTHING;

-- 12. Vérification
SELECT 'Migration 004 appliquée avec succès ✓' AS status;
