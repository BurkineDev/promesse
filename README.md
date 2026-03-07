# PromessTrack

Système de gestion et de suivi des colis pour entreprise d'import-export.

## Stack technique

- **Frontend / Backend** : Next.js 15 (App Router) + TypeScript
- **Base de données** : Supabase (PostgreSQL + Auth + RLS)
- **Styles** : Tailwind CSS
- **Emails** : Resend
- **Icônes** : Lucide React

## Fonctionnalités MVP

| Phase | Fonctionnalité | Statut |
|-------|---------------|--------|
| 1 | Configuration Supabase + schéma BDD | ✅ |
| 2 | Gestion des clients (CRUD) | ✅ |
| 3 | Gestion des colis + tracking auto | ✅ |
| 4 | Portail tracking public | ✅ |
| 5 | Tableau de bord + statistiques | ✅ |
| 6 | Notifications email | ✅ |

## Pages

### Publiques
- `/track` — Portail de suivi (recherche par numéro IMP-YYYY-XXXX)

### Espace admin / agent (authentification requise)
- `/dashboard` — Tableau de bord avec statistiques
- `/dashboard/clients` — Liste, création, modification des clients
- `/dashboard/packages` — Gestion des colis avec filtres par statut
- `/dashboard/packages/[id]` — Détail + mise à jour du statut + timeline
- `/dashboard/payments` — Suivi des paiements

## Installation

### 1. Cloner le projet

```bash
git clone <repo>
cd promesstrack
npm install
```

### 2. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Exécutez le fichier `supabase/migrations/001_initial_schema.sql` dans l'éditeur SQL Supabase
3. Créez votre premier utilisateur admin dans **Authentication > Users**
4. Insérez son profil dans la table `profiles` :

```sql
INSERT INTO profiles (id, name, role)
VALUES ('uuid-de-votre-utilisateur', 'Administrateur', 'admin');
```

### 3. Configurer les variables d'environnement

Copiez `.env.local.example` en `.env.local` et remplissez :

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=notifications@votredomaine.com
NEXT_PUBLIC_APP_URL=https://votredomaine.com
```

### 4. Lancer en développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`.

## Format du numéro de tracking

```
IMP-YYYY-XXXX
```
Exemple : `IMP-2026-0001`

Généré automatiquement par la fonction PostgreSQL `generate_tracking_number()`.

## Statuts des colis

| Code | Label | Description |
|------|-------|-------------|
| `RECU` | Reçu | Colis enregistré |
| `ENTREPOT` | En entrepôt | En attente d'expédition |
| `EXPEDIE` | Expédié | En route vers la destination |
| `EN_TRANSIT` | En transit | Transit maritime/aérien |
| `ARRIVE` | Arrivé | Arrivé à destination |
| `LIVRE` | Livré | Remis au destinataire |

## Notifications email

Les emails sont envoyés automatiquement lors des changements de statut suivants :
- **RECU** — Confirmation d'enregistrement
- **EXPEDIE** — Avis d'expédition
- **ARRIVE** — Avis d'arrivée
- **LIVRE** — Confirmation de livraison

## Structure du projet

```
promesstrack/
├── app/
│   ├── api/
│   │   ├── packages/[id]/status/  # Endpoint notification email
│   │   └── tracking/              # Endpoint tracking public
│   ├── auth/login/                # Page de connexion
│   ├── dashboard/
│   │   ├── clients/               # Gestion clients
│   │   ├── packages/              # Gestion colis
│   │   └── payments/              # Paiements
│   └── track/                     # Portail tracking public
├── components/
│   ├── clients/                   # Formulaire client
│   ├── dashboard/                 # Cartes statistiques
│   ├── layout/                    # Sidebar, Header
│   ├── packages/                  # Formulaire colis, mise à jour statut
│   ├── tracking/                  # Timeline, recherche
│   └── ui/                        # Badge statut
├── lib/
│   ├── email/                     # Notifications Resend
│   ├── supabase/                  # Client browser/server
│   └── utils.ts                   # Formatage dates/monnaies
├── supabase/
│   └── migrations/001_initial_schema.sql
└── types/index.ts                 # Types TypeScript centralisés
```

## Roadmap future

- [ ] Upload photo de colis (Supabase Storage)
- [ ] QR code sur bordereau d'expédition
- [ ] Notifications SMS / WhatsApp
- [ ] Application mobile (Expo)
- [ ] Signature électronique de livraison
- [ ] Gestion multi-entrepôts
- [ ] Facturation automatique PDF
- [ ] Analytics logistiques avancés
