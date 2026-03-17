-- ================================================================
-- CORRECTIF DÉFINITIF : Récursion infinie dans les policies RLS
-- ================================================================
-- À coller et exécuter dans l'éditeur SQL de Supabase (une seule fois)
-- ================================================================

-- ── 1. Fonction SECURITY DEFINER (bypasse RLS sur profiles) ────
--    auth_user_role() ne passe pas par le RLS de profiles
--    → élimine toute récursion

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── 2. Supprimer TOUTES les policies existantes ─────────────────

DROP POLICY IF EXISTS "profiles_select"            ON profiles;
DROP POLICY IF EXISTS "profiles_insert"            ON profiles;
DROP POLICY IF EXISTS "profiles_update"            ON profiles;
DROP POLICY IF EXISTS "clients_select"             ON clients;
DROP POLICY IF EXISTS "clients_insert"             ON clients;
DROP POLICY IF EXISTS "clients_update"             ON clients;
DROP POLICY IF EXISTS "clients_delete"             ON clients;
DROP POLICY IF EXISTS "packages_select_staff"      ON packages;
DROP POLICY IF EXISTS "packages_client_select"     ON packages;
DROP POLICY IF EXISTS "packages_client_submit"     ON packages;
DROP POLICY IF EXISTS "packages_insert"            ON packages;
DROP POLICY IF EXISTS "packages_update"            ON packages;
DROP POLICY IF EXISTS "packages_delete"            ON packages;
DROP POLICY IF EXISTS "tracking_events_select"     ON tracking_events;
DROP POLICY IF EXISTS "tracking_events_insert"     ON tracking_events;
DROP POLICY IF EXISTS "payments_select"            ON payments;
DROP POLICY IF EXISTS "payments_insert"            ON payments;
DROP POLICY IF EXISTS "payments_update"            ON payments;
DROP POLICY IF EXISTS "routes_select"              ON routes;
DROP POLICY IF EXISTS "routes_insert"              ON routes;
DROP POLICY IF EXISTS "routes_update"              ON routes;
DROP POLICY IF EXISTS "routes_delete"              ON routes;
DROP POLICY IF EXISTS "shipments_select"           ON shipments;
DROP POLICY IF EXISTS "shipments_insert"           ON shipments;
DROP POLICY IF EXISTS "shipments_update"           ON shipments;
DROP POLICY IF EXISTS "incidents_select"           ON incidents;
DROP POLICY IF EXISTS "incidents_insert"           ON incidents;
DROP POLICY IF EXISTS "incidents_update"           ON incidents;

-- ── 3. PROFILES ─────────────────────────────────────────────────
-- Ici : pas de subquery vers profiles → utilise auth_user_role()

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR auth_user_role() = 'admin'
  );

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR auth_user_role() = 'admin'
  );

-- ── 4. CLIENTS ──────────────────────────────────────────────────

CREATE POLICY "clients_select" ON clients
  FOR SELECT USING (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "clients_update" ON clients
  FOR UPDATE USING (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "clients_delete" ON clients
  FOR DELETE USING (auth_user_role() = 'admin');

-- ── 5. PACKAGES ─────────────────────────────────────────────────
-- Les clients peuvent soumettre leurs propres colis (status = SOUMIS)
-- Le staff voit et gère tout

-- Lecture : client voit ses colis, staff voit tout
CREATE POLICY "packages_select" ON packages
  FOR SELECT USING (
    submitted_by = auth.uid()
    OR auth_user_role() IN ('admin', 'agent')
  );

-- Insertion : client peut soumettre avec status SOUMIS
CREATE POLICY "packages_client_submit" ON packages
  FOR INSERT WITH CHECK (
    status = 'SOUMIS' AND submitted_by = auth.uid()
  );

-- Insertion staff (pour créer des colis directement)
CREATE POLICY "packages_staff_insert" ON packages
  FOR INSERT WITH CHECK (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "packages_update" ON packages
  FOR UPDATE USING (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "packages_delete" ON packages
  FOR DELETE USING (auth_user_role() = 'admin');

-- ── 6. TRACKING EVENTS ──────────────────────────────────────────
-- Lecture publique (suivi sans connexion)

CREATE POLICY "tracking_events_select" ON tracking_events
  FOR SELECT USING (true);

CREATE POLICY "tracking_events_insert" ON tracking_events
  FOR INSERT WITH CHECK (
    auth_user_role() IN ('admin', 'agent')
    OR EXISTS (
      SELECT 1 FROM packages p
      WHERE p.id = package_id AND p.submitted_by = auth.uid()
    )
  );

-- ── 7. PAYMENTS ─────────────────────────────────────────────────

CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "payments_update" ON payments
  FOR UPDATE USING (auth_user_role() IN ('admin', 'agent'));

-- ── 8. ROUTES ───────────────────────────────────────────────────
-- Lecture publique (pour que les clients voient les routes dispo)

CREATE POLICY "routes_select" ON routes
  FOR SELECT USING (true);

CREATE POLICY "routes_insert" ON routes
  FOR INSERT WITH CHECK (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "routes_update" ON routes
  FOR UPDATE USING (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "routes_delete" ON routes
  FOR DELETE USING (auth_user_role() = 'admin');

-- ── 9. SHIPMENTS ────────────────────────────────────────────────

CREATE POLICY "shipments_select" ON shipments
  FOR SELECT USING (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "shipments_insert" ON shipments
  FOR INSERT WITH CHECK (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "shipments_update" ON shipments
  FOR UPDATE USING (auth_user_role() IN ('admin', 'agent'));

-- ── 10. INCIDENTS ───────────────────────────────────────────────

CREATE POLICY "incidents_select" ON incidents
  FOR SELECT USING (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "incidents_insert" ON incidents
  FOR INSERT WITH CHECK (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "incidents_update" ON incidents
  FOR UPDATE USING (auth_user_role() IN ('admin', 'agent'));

-- ── Vérification ────────────────────────────────────────────────
SELECT 'RLS définitif appliqué avec succès ✓' AS status;
