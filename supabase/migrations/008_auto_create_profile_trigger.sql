-- ================================================================
-- Migration 008 : Trigger auto-création profil à l'inscription
-- ================================================================
-- Problème : packages_submitted_by_fkey échoue si l'utilisateur
-- n'a pas encore de ligne dans la table profiles.
-- Solution  : trigger sur auth.users → crée automatiquement le profil
-- ================================================================

-- Fonction appelée par le trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)   -- fallback : partie avant le @
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;   -- si le profil existe déjà, on ne fait rien
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users (se déclenche après chaque nouvel utilisateur)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================================
-- Correctif pour les utilisateurs existants sans profil
-- ================================================================
-- Crée un profil minimal pour chaque auth.user qui n'en a pas encore
INSERT INTO public.profiles (id, name, role)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'role', 'client')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

SELECT 'Trigger auto-profil créé + profils manquants corrigés ✓' AS status;
