-- ============================================================
-- PromessTrack — Correctif RLS : récursion infinie dans les policies
-- ============================================================
-- PROBLÈME : Les policies sur `clients`, `packages`, etc. font un
-- SELECT sur `profiles` pour vérifier le rôle. Or `profiles` a
-- aussi une policy RLS qui se consulte elle-même → boucle infinie.
--
-- SOLUTION : Créer une fonction SECURITY DEFINER qui lit `profiles`
-- sans passer par le RLS, puis l'utiliser dans toutes les policies.
-- ============================================================

-- 1. Fonction helper qui retourne le rôle de l'utilisateur courant
--    SECURITY DEFINER = s'exécute avec les droits du propriétaire (postgres),
--    donc bypasse le RLS de la table profiles.
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 2. Recréer les policies PROFILES
-- ============================================================
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

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

-- ============================================================
-- 3. Recréer les policies CLIENTS
-- ============================================================
DROP POLICY IF EXISTS "clients_select" ON clients;
DROP POLICY IF EXISTS "clients_insert" ON clients;
DROP POLICY IF EXISTS "clients_update" ON clients;
DROP POLICY IF EXISTS "clients_delete" ON clients;

CREATE POLICY "clients_select" ON clients
  FOR SELECT USING (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "clients_update" ON clients
  FOR UPDATE USING (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "clients_delete" ON clients
  FOR DELETE USING (auth_user_role() = 'admin');

-- ============================================================
-- 4. Recréer les policies PACKAGES
-- ============================================================
DROP POLICY IF EXISTS "packages_select_staff" ON packages;
DROP POLICY IF EXISTS "packages_insert" ON packages;
DROP POLICY IF EXISTS "packages_update" ON packages;
DROP POLICY IF EXISTS "packages_delete" ON packages;

CREATE POLICY "packages_select_staff" ON packages
  FOR SELECT USING (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "packages_insert" ON packages
  FOR INSERT WITH CHECK (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "packages_update" ON packages
  FOR UPDATE USING (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "packages_delete" ON packages
  FOR DELETE USING (auth_user_role() = 'admin');

-- ============================================================
-- 5. Recréer les policies TRACKING EVENTS
-- ============================================================
DROP POLICY IF EXISTS "tracking_events_select" ON tracking_events;
DROP POLICY IF EXISTS "tracking_events_insert" ON tracking_events;

-- Lecture publique (pour le portail de suivi sans connexion)
CREATE POLICY "tracking_events_select" ON tracking_events
  FOR SELECT USING (true);

CREATE POLICY "tracking_events_insert" ON tracking_events
  FOR INSERT WITH CHECK (auth_user_role() IN ('admin', 'agent'));

-- ============================================================
-- 6. Recréer les policies PAYMENTS
-- ============================================================
DROP POLICY IF EXISTS "payments_select" ON payments;
DROP POLICY IF EXISTS "payments_insert" ON payments;
DROP POLICY IF EXISTS "payments_update" ON payments;

CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (auth_user_role() IN ('admin', 'agent'));

CREATE POLICY "payments_update" ON payments
  FOR UPDATE USING (auth_user_role() IN ('admin', 'agent'));

-- ============================================================
-- 7. Vérification : doit retourner sans erreur
-- ============================================================
SELECT 'RLS policies corrigées avec succès ✓' AS status;
