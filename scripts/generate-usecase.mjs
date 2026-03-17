import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, convertInchesToTwip,
  Header, Footer,
} from "docx";
import { writeFileSync } from "fs";

// ─── Helpers ────────────────────────────────────────────────────────────────

const BLUE      = "1E40AF";
const LIGHT_BG  = "EFF6FF";
const GRAY_BG   = "F9FAFB";
const BORDER_C  = "BFDBFE";
const WHITE     = "FFFFFF";

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    run: { color: BLUE, bold: true, size: 32 },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 160 },
    run: { color: BLUE, bold: true, size: 26 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    run: { color: "374151", bold: true, size: 22 },
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: "374151", ...opts })],
    spacing: { after: 120 },
  });
}

function bullet(text, bold_prefix = "") {
  return new Paragraph({
    bullet: { level: 0 },
    children: [
      bold_prefix
        ? new TextRun({ text: bold_prefix + " ", bold: true, size: 22, color: "1E40AF" })
        : new TextRun({ text: "• ", size: 22, color: "1E40AF" }),
      new TextRun({ text, size: 22, color: "374151" }),
    ],
    spacing: { after: 80 },
    indent: { left: convertInchesToTwip(0.3) },
  });
}

function separator() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, color: BORDER_C, size: 4 } },
    spacing: { after: 240 },
  });
}

function blueBox(...paragraphs) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.SINGLE, color: BLUE,   size: 8 },
      bottom: { style: BorderStyle.SINGLE, color: BLUE,   size: 8 },
      left:   { style: BorderStyle.SINGLE, color: BLUE,   size: 8 },
      right:  { style: BorderStyle.SINGLE, color: BLUE,   size: 8 },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, color: "auto", fill: LIGHT_BG },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: paragraphs,
          }),
        ],
      }),
    ],
  });
}

function stepTable(steps) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      insideH: { style: BorderStyle.SINGLE, color: "E5E7EB", size: 4 },
      insideV: { style: BorderStyle.NONE },
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
    },
    rows: steps.map(({ num, title, desc }, i) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, color: "auto", fill: i % 2 === 0 ? BLUE : "3B82F6" },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            verticalAlign: "center",
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: String(num), bold: true, color: WHITE, size: 22 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, color: "auto", fill: i % 2 === 0 ? LIGHT_BG : WHITE },
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: title, bold: true, size: 22, color: "1E3A8A" })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 67, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, color: "auto", fill: i % 2 === 0 ? LIGHT_BG : WHITE },
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: desc, size: 22, color: "374151" })],
              }),
            ],
          }),
        ],
      })
    ),
  });
}

function sectionTitle(label, emoji) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, color: BLUE, size: 24 },
      right: { style: BorderStyle.NONE },
      insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, color: "auto", fill: LIGHT_BG },
            margins: { top: 120, bottom: 120, left: 240, right: 240 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${emoji}  ${label}`, bold: true, size: 28, color: BLUE }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ─── Document ───────────────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22, color: "374151" } },
    },
  },
  sections: [
    {
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } },
      },
      headers: {
        default: new Header({
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
                insideH: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.SINGLE, color: BORDER_C, size: 4 },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [
                          new TextRun({ text: "La Promesse ", bold: true, color: BLUE, size: 20 }),
                          new TextRun({ text: "— Services Logistiques", color: "6B7280", size: 18 }),
                        ],
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "Cas d'utilisation — Guide complet", color: "9CA3AF", size: 18 })],
                      })],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "La Promesse Services Logistiques  |  Canada ↔ Afrique de l'Ouest", color: "9CA3AF", size: 18 }),
              ],
            }),
          ],
        }),
      },
      children: [

        // ══════════════════ PAGE DE TITRE ══════════════════
        new Paragraph({
          spacing: { before: 800, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "LA PROMESSE", bold: true, size: 52, color: BLUE })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Services Logistiques Canada ↔ Afrique de l'Ouest", size: 28, color: "6B7280" })],
          spacing: { after: 120 },
        }),
        separator(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "CAS D'UTILISATION", bold: true, size: 40, color: "1E3A8A" })],
          spacing: { after: 120 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Guide complet des fonctionnalités par profil utilisateur", size: 24, color: "6B7280" })],
          spacing: { after: 600 },
        }),
        blueBox(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Ce document décrit les scénarios d'utilisation réels de la plateforme PromessTrack", size: 22, color: "1E3A8A" })],
            spacing: { after: 80 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "pour deux profils : Administrateur / Agent   et   Client expéditeur.", size: 22, color: "1E3A8A", bold: true })],
          }),
        ),
        new Paragraph({ spacing: { after: 400 } }),

        // ══════════════════ SOMMAIRE ══════════════════
        h1("Sommaire"),
        separator(),
        para("PARTIE A — Cas d'utilisation : Administrateur / Agent", { bold: true, color: BLUE, size: 24 }),
        bullet("UC-A1  Connexion et accès au tableau de bord"),
        bullet("UC-A2  Créer un nouveau colis"),
        bullet("UC-A3  Mettre à jour le statut d'un colis"),
        bullet("UC-A4  Gérer les clients"),
        bullet("UC-A5  Valider les demandes clients"),
        bullet("UC-A6  Gérer les paiements"),
        bullet("UC-A7  Créer et gérer les expéditions"),
        bullet("UC-A8  Traiter un incident"),
        bullet("UC-A9  Publier une annonce"),
        new Paragraph({ spacing: { after: 160 } }),
        para("PARTIE B — Cas d'utilisation : Client expéditeur", { bold: true, color: BLUE, size: 24 }),
        bullet("UC-B1  Inscription et connexion au portail"),
        bullet("UC-B2  Soumettre une demande d'envoi"),
        bullet("UC-B3  Suivre ses colis"),
        bullet("UC-B4  Suivi public (sans compte)"),
        new Paragraph({ spacing: { after: 400 } }),

        // ══════════════════ PARTIE A ══════════════════
        sectionTitle("PARTIE A — Administrateur / Agent", "🛠️"),
        new Paragraph({ spacing: { after: 240 } }),

        // UC-A1
        h2("UC-A1 — Connexion et accès au tableau de bord"),
        h3("Acteurs"),
        bullet("Administrateur ou Agent"),
        h3("Pré-conditions"),
        bullet("Compte créé par l'administrateur dans Supabase"),
        bullet("Rôle défini : admin ou agent"),
        h3("Scénario principal"),
        stepTable([
          { num: 1, title: "Accès",       desc: "L'utilisateur ouvre l'URL de l'application et est redirigé vers /auth/login." },
          { num: 2, title: "Connexion",   desc: "Il saisit son email et mot de passe, puis clique sur « Se connecter »." },
          { num: 3, title: "Vérification",desc: "Le système vérifie les identifiants via Supabase Auth et contrôle le rôle (admin/agent)." },
          { num: 4, title: "Dashboard",   desc: "L'utilisateur est redirigé vers /dashboard et voit les statistiques du jour : colis créés, en transit, livrés, revenus." },
          { num: 5, title: "Navigation",  desc: "La sidebar permet d'accéder à tous les modules : Colis, Clients, Paiements, Expéditions, Incidents, Annonces." },
        ]),
        h3("Post-conditions"),
        bullet("Session active — accès à toutes les fonctionnalités selon le rôle"),
        h3("Cas alternatif"),
        bullet("Identifiants incorrects → message d'erreur, accès refusé"),
        bullet("Rôle client → redirection vers le portail client"),
        new Paragraph({ spacing: { after: 200 } }),
        separator(),

        // UC-A2
        h2("UC-A2 — Créer un nouveau colis"),
        h3("Acteurs"),
        bullet("Administrateur ou Agent"),
        h3("Pré-conditions"),
        bullet("Au moins un client existant dans la base"),
        h3("Scénario principal"),
        stepTable([
          { num: 1, title: "Accès",        desc: "L'agent va dans Dashboard → Colis → « Nouveau colis »." },
          { num: 2, title: "Formulaire",   desc: "Il choisit le client expéditeur depuis la liste déroulante." },
          { num: 3, title: "Contenu",      desc: "Il renseigne : description, catégorie (Vêtements, Électronique, Médicaments…), poids, dimensions." },
          { num: 4, title: "Itinéraire",   desc: "Il sélectionne l'origine, la destination et la direction (Canada → Afrique ou Afrique → Canada)." },
          { num: 5, title: "Options",      desc: "Il coche « Urgent » si prioritaire (surcoût de 30 % appliqué automatiquement)." },
          { num: 6, title: "Prix",         desc: "Le système calcule le prix estimé selon la route et le poids." },
          { num: 7, title: "Enregistrement",desc: "L'agent clique « Enregistrer » → le numéro de suivi IMP-2026-XXXX est généré automatiquement." },
        ]),
        h3("Post-conditions"),
        bullet("Colis créé avec statut initial RECU"),
        bullet("Numéro de tracking unique généré et visible"),
        bullet("Email de confirmation envoyé au client"),
        new Paragraph({ spacing: { after: 200 } }),
        separator(),

        // UC-A3
        h2("UC-A3 — Mettre à jour le statut d'un colis"),
        h3("Acteurs"),
        bullet("Administrateur ou Agent"),
        h3("Scénario principal"),
        stepTable([
          { num: 1, title: "Sélection",    desc: "L'agent ouvre la fiche d'un colis depuis la liste ou via le numéro de tracking." },
          { num: 2, title: "Mise à jour",  desc: "Il clique sur « Mettre à jour le statut »." },
          { num: 3, title: "Choix statut", desc: "Il sélectionne le nouveau statut dans la liste (ex : EN_TRANSIT, ARRIVE, LIVRE)." },
          { num: 4, title: "Localisation", desc: "Il peut ajouter une localisation (ex : « Aéroport de Ouagadougou ») et une note." },
          { num: 5, title: "Notification", desc: "Le système enregistre l'événement et envoie un email HTML automatique au client." },
          { num: 6, title: "Timeline",     desc: "L'historique des statuts s'affiche en ordre chronologique sur la fiche colis." },
        ]),
        h3("Statuts avec email automatique"),
        bullet("RECU — Colis bien réceptionné"),
        bullet("EXPEDIE — Colis en route"),
        bullet("ARRIVE — Colis arrivé à destination"),
        bullet("LIVRE — Colis remis au destinataire"),
        new Paragraph({ spacing: { after: 200 } }),
        separator(),

        // UC-A4
        h2("UC-A4 — Gérer les clients"),
        h3("Acteurs"),
        bullet("Administrateur ou Agent"),
        h3("Scénario principal — Créer un client"),
        stepTable([
          { num: 1, title: "Accès",       desc: "Dashboard → Clients → « Nouveau client »." },
          { num: 2, title: "Formulaire",  desc: "Remplir : Nom complet, Téléphone, Email, Adresse, Notes éventuelles." },
          { num: 3, title: "Enregistrement",desc: "Cliquer « Enregistrer » → le client apparaît dans la liste." },
        ]),
        h3("Autres actions"),
        bullet("Modifier les informations d'un client"),
        bullet("Consulter tous les colis liés à un client"),
        bullet("Rechercher un client par nom, email ou téléphone"),
        new Paragraph({ spacing: { after: 200 } }),
        separator(),

        // UC-A5
        h2("UC-A5 — Valider les demandes clients"),
        h3("Contexte"),
        para("Quand un client soumet un colis depuis son portail, la demande arrive en file d'attente avec le statut SOUMIS. L'administrateur doit la valider."),
        h3("Scénario principal"),
        stepTable([
          { num: 1, title: "Alerte",      desc: "Un badge rouge sur « Validation » dans la sidebar indique le nombre de demandes en attente." },
          { num: 2, title: "Consultation",desc: "L'admin ouvre /dashboard/validation et voit la liste des demandes à traiter." },
          { num: 3, title: "Vérification",desc: "Il contrôle les informations : description, poids, destination, valeur déclarée." },
          { num: 4, title: "Validation",  desc: "Il valide → le statut passe à RECU et un email de confirmation est envoyé au client." },
          { num: 5, title: "Rejet",       desc: "Il peut rejeter avec une note explicative si les informations sont incorrectes." },
        ]),
        new Paragraph({ spacing: { after: 200 } }),
        separator(),

        // UC-A6
        h2("UC-A6 — Gérer les paiements"),
        h3("Acteurs"),
        bullet("Administrateur"),
        h3("Scénario principal — Enregistrer un paiement"),
        stepTable([
          { num: 1, title: "Accès",       desc: "Dashboard → Paiements → « Ajouter un paiement »." },
          { num: 2, title: "Colis",       desc: "Sélectionner le colis concerné." },
          { num: 3, title: "Montant",     desc: "Renseigner le montant en CAD." },
          { num: 4, title: "Méthode",     desc: "Choisir la méthode : Cash, Virement bancaire, Carte, Mobile Money." },
          { num: 5, title: "Statut",      desc: "Définir le statut : En attente / Payé / Remboursé." },
          { num: 6, title: "Validation",  desc: "Enregistrer → le paiement apparaît dans le tableau de bord financier." },
        ]),
        h3("Tableau de bord financier"),
        bullet("Total encaissé (paiements PAYE)"),
        bullet("Total en attente (paiements EN_ATTENTE)"),
        bullet("Total général"),
        new Paragraph({ spacing: { after: 200 } }),
        separator(),

        // UC-A7
        h2("UC-A7 — Créer et gérer les expéditions"),
        h3("Contexte"),
        para("Les expéditions (lots) regroupent plusieurs colis partant ensemble sur la même route."),
        h3("Scénario principal"),
        stepTable([
          { num: 1, title: "Accès",         desc: "Dashboard → Lots / Départs → « Nouvelle expédition »." },
          { num: 2, title: "Informations",  desc: "Nommer le lot (ex : « Lot Mars 2026 »), choisir la route depuis les routes pré-configurées." },
          { num: 3, title: "Dates",         desc: "Renseigner la date de départ et la date d'arrivée estimée." },
          { num: 4, title: "Affectation",   desc: "Associer les colis préparés à cette expédition depuis leurs fiches respectives." },
          { num: 5, title: "Départ",        desc: "Passer le statut à EN_COURS quand le lot part, puis ARRIVE à réception." },
        ]),
        h3("Routes disponibles"),
        bullet("Montréal → Ouagadougou (Burkina Faso) — Air — ~5 jours"),
        bullet("Montréal → Bamako (Mali) — Air — ~6 jours"),
        bullet("Montréal → Dakar (Sénégal) — Air — ~5 jours"),
        bullet("Montréal → Abidjan (Côte d'Ivoire) — Air — ~5 jours"),
        bullet("Afrique → Canada (retour) — Air — ~7 jours"),
        new Paragraph({ spacing: { after: 200 } }),
        separator(),

        // UC-A8
        h2("UC-A8 — Traiter un incident"),
        h3("Acteurs"),
        bullet("Administrateur"),
        h3("Scénario principal"),
        stepTable([
          { num: 1, title: "Signalement",   desc: "Un problème est détecté : colis endommagé, perdu, bloqué en douane, retard…" },
          { num: 2, title: "Création",      desc: "Dashboard → Incidents → choisir le type d'incident et le colis concerné." },
          { num: 3, title: "Description",   desc: "Décrire la situation précisément pour le suivi interne." },
          { num: 4, title: "Traitement",    desc: "Passer le statut à EN_TRAITEMENT quand la résolution est en cours." },
          { num: 5, title: "Résolution",    desc: "Marquer RESOLU une fois le problème réglé, puis FERME pour archiver." },
        ]),
        h3("Types d'incidents gérés"),
        bullet("Colis endommagé"),
        bullet("Colis perdu"),
        bullet("Bloqué en douane"),
        bullet("Informations incomplètes"),
        bullet("Retard de livraison"),
        bullet("Non récupéré par le destinataire"),
        new Paragraph({ spacing: { after: 200 } }),
        separator(),

        // UC-A9
        h2("UC-A9 — Publier une annonce"),
        h3("Acteurs"),
        bullet("Administrateur"),
        h3("Scénario principal"),
        stepTable([
          { num: 1, title: "Accès",        desc: "Dashboard → Annonces → composer un message." },
          { num: 2, title: "Contenu",      desc: "Rédiger le titre et le corps de l'annonce, ajouter une image si souhaité." },
          { num: 3, title: "Catégorie",    desc: "Choisir : INFO, PROMO, ALERTE, TÉMOIGNAGE ou NOUVEAU SERVICE." },
          { num: 4, title: "Publication",  desc: "Activer « Publier » → l'annonce apparaît sur la page d'accueil et le portail client." },
        ]),
        new Paragraph({ spacing: { after: 400 } }),

        // ══════════════════ PARTIE B ══════════════════
        sectionTitle("PARTIE B — Client expéditeur", "📦"),
        new Paragraph({ spacing: { after: 240 } }),

        // UC-B1
        h2("UC-B1 — Inscription et connexion au portail"),
        h3("Acteurs"),
        bullet("Client particulier ou professionnel"),
        h3("Scénario principal — Première connexion"),
        stepTable([
          { num: 1, title: "Inscription",  desc: "Le client accède à /portal/register et crée son compte (nom, email, mot de passe, téléphone)." },
          { num: 2, title: "Confirmation", desc: "Un email de confirmation est envoyé. Le client clique sur le lien pour valider son compte." },
          { num: 3, title: "Connexion",    desc: "Il se connecte sur /auth/login avec ses identifiants." },
          { num: 4, title: "Portail",      desc: "Il est redirigé vers /portal qui affiche un résumé de ses envois et les actions disponibles." },
        ]),
        new Paragraph({ spacing: { after: 200 } }),
        separator(),

        // UC-B2
        h2("UC-B2 — Soumettre une demande d'envoi"),
        h3("Acteurs"),
        bullet("Client connecté"),
        h3("Scénario principal"),
        stepTable([
          { num: 1, title: "Formulaire",   desc: "Le client va dans Portail → « Soumettre un colis » (/portal/submit)." },
          { num: 2, title: "Description",  desc: "Il décrit le contenu du colis, sa catégorie et son poids estimé." },
          { num: 3, title: "Destination",  desc: "Il indique l'origine, la destination et la direction de l'envoi." },
          { num: 4, title: "Options",      desc: "Il peut cocher « Urgent » pour un traitement prioritaire." },
          { num: 5, title: "Soumission",   desc: "Il soumet le formulaire → la demande est envoyée en file de validation avec le statut SOUMIS." },
          { num: 6, title: "Attente",      desc: "Il reçoit une notification indiquant que sa demande est en attente de validation par l'équipe." },
        ]),
        h3("Post-conditions"),
        bullet("La demande apparaît dans « Mes colis » avec le statut SOUMIS"),
        bullet("L'administrateur voit la demande dans la file de validation"),
        new Paragraph({ spacing: { after: 200 } }),
        separator(),

        // UC-B3
        h2("UC-B3 — Suivre ses colis (portail connecté)"),
        h3("Acteurs"),
        bullet("Client connecté"),
        h3("Scénario principal"),
        stepTable([
          { num: 1, title: "Portail",      desc: "Le client se connecte et accède à /portal/mes-colis." },
          { num: 2, title: "Liste",        desc: "Il voit tous ses colis avec leur numéro de tracking, statut actuel et destination." },
          { num: 3, title: "Détail",       desc: "Il clique sur un colis pour voir la timeline complète des événements." },
          { num: 4, title: "Timeline",     desc: "Chaque mise à jour de statut apparaît avec la date, l'heure et la localisation." },
          { num: 5, title: "Email",        desc: "Pour chaque changement de statut important, il reçoit un email avec un lien de suivi." },
        ]),
        h3("Informations visibles"),
        bullet("Numéro de suivi (IMP-2026-XXXX)"),
        bullet("Statut actuel avec badge coloré"),
        bullet("Historique complet des événements"),
        bullet("Destination et poids du colis"),
        new Paragraph({ spacing: { after: 200 } }),
        separator(),

        // UC-B4
        h2("UC-B4 — Suivi public (sans compte)"),
        h3("Acteurs"),
        bullet("Destinataire ou toute personne disposant du numéro de suivi"),
        h3("Contexte"),
        para("Le destinataire en Afrique ou un proche peut suivre un colis sans créer de compte, simplement avec le numéro de tracking."),
        h3("Scénario principal"),
        stepTable([
          { num: 1, title: "Accès",        desc: "L'utilisateur accède à /track depuis n'importe quel navigateur (mobile ou desktop)." },
          { num: 2, title: "Saisie",       desc: "Il saisit le numéro de suivi (format IMP-2026-XXXX) dans le champ de recherche." },
          { num: 3, title: "Résultats",    desc: "Le système affiche la fiche du colis : description, origine, destination, statut actuel." },
          { num: 4, title: "Timeline",     desc: "Une timeline visuelle montre l'historique complet : chaque étape avec date, heure et lieu." },
          { num: 5, title: "Contact",      desc: "Des boutons WhatsApp permettent de contacter l'équipe directement depuis la page." },
        ]),
        h3("Post-conditions"),
        bullet("Aucun compte requis — accessible 24h/24"),
        bullet("Compatible mobile, tablette et desktop"),
        new Paragraph({ spacing: { after: 400 } }),

        // ══════════════════ RÉSUMÉ ══════════════════
        sectionTitle("Résumé des cas d'utilisation", "📋"),
        new Paragraph({ spacing: { after: 200 } }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            insideH: { style: BorderStyle.SINGLE, color: "E5E7EB", size: 4 },
            insideV: { style: BorderStyle.SINGLE, color: "E5E7EB", size: 4 },
            top:    { style: BorderStyle.SINGLE, color: BLUE, size: 8 },
            bottom: { style: BorderStyle.SINGLE, color: BLUE, size: 8 },
            left:   { style: BorderStyle.SINGLE, color: BLUE, size: 8 },
            right:  { style: BorderStyle.SINGLE, color: BLUE, size: 8 },
          },
          rows: [
            // Header row
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  shading: { type: ShadingType.CLEAR, color: "auto", fill: BLUE },
                  margins: { top: 120, bottom: 120, left: 160, right: 160 },
                  children: [new Paragraph({ children: [new TextRun({ text: "Code", bold: true, color: WHITE, size: 20 })] })],
                }),
                new TableCell({
                  shading: { type: ShadingType.CLEAR, color: "auto", fill: BLUE },
                  margins: { top: 120, bottom: 120, left: 160, right: 160 },
                  children: [new Paragraph({ children: [new TextRun({ text: "Cas d'utilisation", bold: true, color: WHITE, size: 20 })] })],
                }),
                new TableCell({
                  shading: { type: ShadingType.CLEAR, color: "auto", fill: BLUE },
                  margins: { top: 120, bottom: 120, left: 160, right: 160 },
                  children: [new Paragraph({ children: [new TextRun({ text: "Acteur", bold: true, color: WHITE, size: 20 })] })],
                }),
                new TableCell({
                  shading: { type: ShadingType.CLEAR, color: "auto", fill: BLUE },
                  margins: { top: 120, bottom: 120, left: 160, right: 160 },
                  children: [new Paragraph({ children: [new TextRun({ text: "URL", bold: true, color: WHITE, size: 20 })] })],
                }),
              ],
            }),
            // Data rows
            ...[
              ["UC-A1", "Connexion et tableau de bord",    "Admin / Agent",   "/dashboard"],
              ["UC-A2", "Créer un nouveau colis",          "Admin / Agent",   "/dashboard/packages/new"],
              ["UC-A3", "Mettre à jour le statut",         "Admin / Agent",   "/dashboard/packages/[id]"],
              ["UC-A4", "Gérer les clients",               "Admin / Agent",   "/dashboard/clients"],
              ["UC-A5", "Valider les demandes clients",    "Admin",           "/dashboard/validation"],
              ["UC-A6", "Gérer les paiements",             "Admin",           "/dashboard/payments"],
              ["UC-A7", "Créer et gérer les expéditions",  "Admin / Agent",   "/dashboard/shipments"],
              ["UC-A8", "Traiter un incident",             "Admin",           "/dashboard/incidents"],
              ["UC-A9", "Publier une annonce",             "Admin",           "/dashboard/annonces"],
              ["UC-B1", "Inscription / Connexion portail", "Client",          "/portal/register"],
              ["UC-B2", "Soumettre une demande d'envoi",   "Client",          "/portal/submit"],
              ["UC-B3", "Suivre ses colis (connecté)",     "Client",          "/portal/mes-colis"],
              ["UC-B4", "Suivi public sans compte",        "Tout public",     "/track"],
            ].map(([code, label, actor, url], i) =>
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, color: "auto", fill: i % 2 === 0 ? LIGHT_BG : WHITE },
                    margins: { top: 100, bottom: 100, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: code, bold: true, size: 20, color: BLUE })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, color: "auto", fill: i % 2 === 0 ? LIGHT_BG : WHITE },
                    margins: { top: 100, bottom: 100, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: label, size: 20, color: "374151" })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, color: "auto", fill: i % 2 === 0 ? LIGHT_BG : WHITE },
                    margins: { top: 100, bottom: 100, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: actor, size: 20, color: "374151" })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, color: "auto", fill: i % 2 === 0 ? LIGHT_BG : WHITE },
                    margins: { top: 100, bottom: 100, left: 160, right: 160 },
                    children: [new Paragraph({ children: [new TextRun({ text: url, size: 18, color: "6B7280", font: "Courier New" })] })],
                  }),
                ],
              })
            ),
          ],
        }),

        new Paragraph({ spacing: { after: 400 } }),

        // Contacts
        blueBox(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Support & Contact", bold: true, size: 24, color: BLUE })],
            spacing: { after: 120 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "WhatsApp Canada : +1 439 978-2990", size: 22, color: "374151" })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "WhatsApp Burkina Faso : +226 66 03 16 61", size: 22, color: "374151" })],
          }),
        ),

      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("La_Promesse_CasUtilisation.docx", buffer);
console.log("✅ Fichier généré : La_Promesse_CasUtilisation.docx");
