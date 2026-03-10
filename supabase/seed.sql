-- ============================================================
-- PromessTrack — Données de démonstration
-- ============================================================
-- Exécuter dans : Supabase Dashboard > SQL Editor
-- URL : https://supabase.com/dashboard/project/uufbzgwwamyswisrskvy/sql/new
--
-- IMPORTANT : Exécuter 001_initial_schema.sql ET 002_storage.sql avant ce fichier.
--
-- COMPTE DÉMO ADMIN :
--   1. Aller dans Authentication > Users > Add user
--   2. Email    : admin@promesstrack.com
--   3. Password : Demo2026!
--   4. Copier l'UUID généré et remplacer ADMIN_UUID ci-dessous
--   5. Décommenter et exécuter la ligne INSERT INTO profiles...
-- ============================================================

-- Décommenter et remplacer par votre UUID admin :
-- INSERT INTO profiles (id, name, role)
-- VALUES ('ADMIN_UUID_ICI', 'Jean-Paul Kaboré', 'admin')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CLIENTS (5 expéditeurs / destinataires)
-- ============================================================
INSERT INTO clients (id, name, phone, email, address, notes) VALUES
(
  'c1000000-0000-0000-0000-000000000001',
  'Aminata Traoré',
  '+1 514-555-0101',
  'aminata.traore@gmail.com',
  '4521 Rue Saint-Denis, Montréal, QC H2J 2L4',
  'Cliente régulière — famille à Ouagadougou'
),
(
  'c1000000-0000-0000-0000-000000000002',
  'Boubacar Diallo',
  '+1 514-555-0202',
  'b.diallo@hotmail.com',
  '1780 Boulevard Pie-IX, Montréal, QC H1V 2C3',
  'Commerçant — importe des tissus et gadgets électroniques'
),
(
  'c1000000-0000-0000-0000-000000000003',
  'Fatima Ouédraogo',
  '+1 450-555-0303',
  'fatima.ouedraogo@yahoo.fr',
  '2300 Boulevard Daniel-Johnson, Laval, QC H7T 2P6',
  NULL
),
(
  'c1000000-0000-0000-0000-000000000004',
  'Ibrahim Koné',
  '+1 450-555-0404',
  'ibrahim.kone@gmail.com',
  '8500 Boulevard Taschereau, Brossard, QC J4X 1C4',
  'Préfère être contacté par WhatsApp'
),
(
  'c1000000-0000-0000-0000-000000000005',
  'Marie-Claire Sawadogo',
  '+1 514-555-0505',
  'mc.sawadogo@gmail.com',
  '6789 Avenue du Parc, Montréal, QC H3N 1X5',
  'Employée — envoie régulièrement des colis à sa mère'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  notes = EXCLUDED.notes;

-- ============================================================
-- COLIS (6 colis — tous les statuts représentés)
-- ============================================================
INSERT INTO packages (id, tracking_number, client_id, description, weight, destination, origin, status, price, notes) VALUES
(
  'p1000000-0000-0000-0000-000000000001',
  'IMP-2026-0001',
  'c1000000-0000-0000-0000-000000000001',
  'Vêtements, chaussures et médicaments',
  18.5,
  'Ouagadougou, Burkina Faso',
  'Montréal, Canada',
  'LIVRE',
  120.00,
  'Livré sans problème'
),
(
  'p1000000-0000-0000-0000-000000000002',
  'IMP-2026-0002',
  'c1000000-0000-0000-0000-000000000002',
  'Téléphones reconditionnés et accessoires électroniques',
  9.2,
  'Dakar, Sénégal',
  'Montréal, Canada',
  'EN_TRANSIT',
  95.00,
  'Cargaison maritime — conteneur MSCU4521876'
),
(
  'p1000000-0000-0000-0000-000000000003',
  'IMP-2026-0003',
  'c1000000-0000-0000-0000-000000000003',
  'Produits cosmétiques et soins capillaires',
  5.8,
  'Abidjan, Côte d''Ivoire',
  'Montréal, Canada',
  'EXPEDIE',
  75.00,
  NULL
),
(
  'p1000000-0000-0000-0000-000000000004',
  'IMP-2026-0004',
  'c1000000-0000-0000-0000-000000000004',
  'Matériel scolaire et livres',
  12.0,
  'Bamako, Mali',
  'Montréal, Canada',
  'ENTREPOT',
  80.00,
  'En attente de consolidation avec autres colis'
),
(
  'p1000000-0000-0000-0000-000000000005',
  'IMP-2026-0005',
  'c1000000-0000-0000-0000-000000000005',
  'Vêtements enfants et jouets',
  7.3,
  'Ouagadougou, Burkina Faso',
  'Montréal, Canada',
  'ARRIVE',
  65.00,
  'Dédouanement en cours'
),
(
  'p1000000-0000-0000-0000-000000000006',
  'IMP-2026-0006',
  'c1000000-0000-0000-0000-000000000001',
  'Épices, thé et produits alimentaires non périssables',
  3.5,
  'Lomé, Togo',
  'Montréal, Canada',
  'RECU',
  45.00,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  weight = EXCLUDED.weight,
  destination = EXCLUDED.destination,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  notes = EXCLUDED.notes;

-- Mettre à jour la séquence pour continuer après les données de démo
SELECT setval('tracking_number_seq', 6);

-- ============================================================
-- ÉVÉNEMENTS DE TRACKING
-- ============================================================
-- Colis 1 : IMP-2026-0001 — LIVRÉ (historique complet)
INSERT INTO tracking_events (package_id, status, location, notes, created_at) VALUES
('p1000000-0000-0000-0000-000000000001', 'RECU',       'Montréal, Canada',         'Colis enregistré et pesé',           NOW() - INTERVAL '30 days'),
('p1000000-0000-0000-0000-000000000001', 'ENTREPOT',   'Entrepôt Montréal',        'Consolidé avec d''autres envois',     NOW() - INTERVAL '28 days'),
('p1000000-0000-0000-0000-000000000001', 'EXPEDIE',    'Aéroport YUL, Montréal',   'Vol Air Maroc AT201 — départ 22h15', NOW() - INTERVAL '25 days'),
('p1000000-0000-0000-0000-000000000001', 'EN_TRANSIT', 'Aéroport CMN, Casablanca', 'Escale technique — 4h d''attente',   NOW() - INTERVAL '24 days'),
('p1000000-0000-0000-0000-000000000001', 'ARRIVE',     'Aéroport OUA, Ouagadougou','Dédouanement effectué',               NOW() - INTERVAL '18 days'),
('p1000000-0000-0000-0000-000000000001', 'LIVRE',      'Ouagadougou, Secteur 15',  'Remis à la destinataire en mains propres', NOW() - INTERVAL '15 days')
ON CONFLICT DO NOTHING;

-- Colis 2 : IMP-2026-0002 — EN TRANSIT
INSERT INTO tracking_events (package_id, status, location, notes, created_at) VALUES
('p1000000-0000-0000-0000-000000000002', 'RECU',       'Montréal, Canada',        'Colis enregistré',                     NOW() - INTERVAL '12 days'),
('p1000000-0000-0000-0000-000000000002', 'ENTREPOT',   'Entrepôt Montréal',       'En attente de départ maritime',        NOW() - INTERVAL '10 days'),
('p1000000-0000-0000-0000-000000000002', 'EXPEDIE',    'Port de Montréal',        'Chargé sur cargo MSC Dakar Express',   NOW() - INTERVAL '8 days'),
('p1000000-0000-0000-0000-000000000002', 'EN_TRANSIT', 'Océan Atlantique',        'En route — arrivée estimée dans 6 j',  NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- Colis 3 : IMP-2026-0003 — EXPÉDIÉ
INSERT INTO tracking_events (package_id, status, location, notes, created_at) VALUES
('p1000000-0000-0000-0000-000000000003', 'RECU',     'Montréal, Canada',       'Colis enregistré et emballé',          NOW() - INTERVAL '6 days'),
('p1000000-0000-0000-0000-000000000003', 'ENTREPOT', 'Entrepôt Montréal',      'Prêt pour expédition',                 NOW() - INTERVAL '5 days'),
('p1000000-0000-0000-0000-000000000003', 'EXPEDIE',  'Aéroport YUL, Montréal', 'Vol Ethiopian Airlines ET509',         NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Colis 4 : IMP-2026-0004 — EN ENTREPÔT
INSERT INTO tracking_events (package_id, status, location, notes, created_at) VALUES
('p1000000-0000-0000-0000-000000000004', 'RECU',     'Montréal, Canada',  'Colis enregistré',               NOW() - INTERVAL '3 days'),
('p1000000-0000-0000-0000-000000000004', 'ENTREPOT', 'Entrepôt Montréal', 'Consolidation en cours — 2/5 colis pour Bamako', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Colis 5 : IMP-2026-0005 — ARRIVÉ
INSERT INTO tracking_events (package_id, status, location, notes, created_at) VALUES
('p1000000-0000-0000-0000-000000000005', 'RECU',       'Montréal, Canada',         'Colis enregistré',                    NOW() - INTERVAL '20 days'),
('p1000000-0000-0000-0000-000000000005', 'ENTREPOT',   'Entrepôt Montréal',        'En attente d''expédition',            NOW() - INTERVAL '18 days'),
('p1000000-0000-0000-0000-000000000005', 'EXPEDIE',    'Aéroport YUL, Montréal',   'Vol direct Air Burkina',              NOW() - INTERVAL '15 days'),
('p1000000-0000-0000-0000-000000000005', 'EN_TRANSIT', 'Aéroport CDG, Paris',      'Escale Paris — correspondance',       NOW() - INTERVAL '14 days'),
('p1000000-0000-0000-0000-000000000005', 'ARRIVE',     'Aéroport OUA, Ouagadougou','Dédouanement en cours — 1 à 2 jours', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Colis 6 : IMP-2026-0006 — REÇU (tout juste arrivé)
INSERT INTO tracking_events (package_id, status, location, notes, created_at) VALUES
('p1000000-0000-0000-0000-000000000006', 'RECU', 'Montréal, Canada', 'Colis enregistré et contrôlé', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PAIEMENTS
-- ============================================================
INSERT INTO payments (package_id, amount, method, status, notes) VALUES
('p1000000-0000-0000-0000-000000000001', 120.00, 'CASH',     'PAYE',       'Payé en espèces à la remise du colis'),
('p1000000-0000-0000-0000-000000000002',  95.00, 'VIREMENT', 'PAYE',       'Virement Interac — réf. TXN-20260228'),
('p1000000-0000-0000-0000-000000000003',  75.00, 'MOBILE',   'EN_ATTENTE', 'En attente de confirmation Mobile Money'),
('p1000000-0000-0000-0000-000000000004',  80.00, 'CASH',     'EN_ATTENTE', 'Solde à payer à l''expédition'),
('p1000000-0000-0000-0000-000000000005',  65.00, 'CARTE',    'PAYE',       'Visa — 4 derniers chiffres : 4242'),
('p1000000-0000-0000-0000-000000000006',  45.00, 'CASH',     'EN_ATTENTE', 'À encaisser')
ON CONFLICT DO NOTHING;

-- ============================================================
-- VÉRIFICATION : afficher un résumé des données insérées
-- ============================================================
SELECT
  (SELECT COUNT(*) FROM clients)         AS clients,
  (SELECT COUNT(*) FROM packages)        AS colis,
  (SELECT COUNT(*) FROM tracking_events) AS evenements,
  (SELECT COUNT(*) FROM payments)        AS paiements,
  (SELECT COALESCE(SUM(amount),0) FROM payments WHERE status = 'PAYE') AS revenus_confirmes;
