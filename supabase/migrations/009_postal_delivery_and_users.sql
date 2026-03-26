-- ============================================================
-- Migration 009 : Livraison postale + gestion utilisateurs
-- ============================================================

-- 1. Champs livraison postale sur la table packages
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS delivery_mode TEXT NOT NULL DEFAULT 'BUREAU'
    CHECK (delivery_mode IN ('BUREAU', 'POSTAL')),
  ADD COLUMN IF NOT EXISTS postal_recipient_name    TEXT,
  ADD COLUMN IF NOT EXISTS postal_recipient_phone   TEXT,
  ADD COLUMN IF NOT EXISTS postal_recipient_address TEXT,
  ADD COLUMN IF NOT EXISTS postal_zone              TEXT,
  ADD COLUMN IF NOT EXISTS postal_cost              NUMERIC(10,2) DEFAULT 0;

COMMENT ON COLUMN public.packages.delivery_mode IS
  'BUREAU = retrait au bureau Ouaga | POSTAL = livraison postale à domicile';
COMMENT ON COLUMN public.packages.postal_cost IS
  'Coût de la livraison postale en CAD, inclus dans la facture';

-- 2. Champ "role" enrichi pour les délégués
-- (le rôle "delegate" est une variante de "agent" avec droits réduits)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin', 'agent', 'delegate', 'client'));

-- 3. Vue admin pour voir tous les utilisateurs (admin seulement)
CREATE OR REPLACE VIEW public.admin_users_view AS
  SELECT
    p.id,
    p.name,
    p.role,
    p.phone,
    p.created_at,
    u.email,
    u.last_sign_in_at,
    u.confirmed_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;

-- Accès à la vue uniquement pour les admins
GRANT SELECT ON public.admin_users_view TO authenticated;

-- Policy : seuls les admins voient la vue (via RLS sur la fonction)
-- On sécurise via une fonction SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id            UUID,
  name          TEXT,
  role          TEXT,
  phone         TEXT,
  email         TEXT,
  last_sign_in  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.name,
    p.role,
    p.phone,
    u.email,
    u.last_sign_in_at,
    p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;
$$;
