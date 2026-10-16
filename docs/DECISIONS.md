# Broco-Chou — Décisions d'architecture

**Objectif :** Expliquer les choix confirmés et conserver les propositions encore ouvertes.
**Dernière mise à jour :** 2026-10-17
**Statut :** Registre établi pendant l'audit ; dates ci-dessous = date de formalisation, sans date historique inventée.
**Documents liés :** [Produit](PRD.md), [Architecture](TRD.md), [Backend](BACKEND_SCHEMA.md), [Roadmap](IMPLEMENTATION_PLAN.md).

## ADR-001 — Conserver Next.js et l'hébergement Vercel

**Statut :** Accepted
**Date :** 2026-10-17

### Contexte

L'application livrée utilise Next.js App Router, React et Vercel. La mission privilégie stabilité et coûts minimaux.

### Décision

Conserver la stack et l'URL Vercel gratuite `recipe-app-alpha-wine.vercel.app`, sans domaine personnalisé imposé, ni migration de framework ou refonte UI.

### Alternatives considérées

Changer de stack/hébergeur, imposer un domaine : aucune nécessité démontrée pour cette mission.

### Conséquences

Installation reproductible `npm ci`, revue des alertes de dépendances séparée et autorisation avant déploiement. Les mises à jour de sécurité restent à examiner, sans figer indéfiniment une version vulnérable.

### Références

[package.json](../package.json), [vercel.json](../vercel.json), [TRD](TRD.md).

## ADR-002 — Préserver Supabase Auth et la confirmation e-mail

**Statut :** Accepted
**Date :** 2026-10-17

### Contexte

Le parcours e-mail/mot de passe fonctionne pour les comptes testés et les comptes existants doivent être préservés.

### Décision

Conserver `signUp`, `signInWithPassword`, `resend`, `signOut`, persistance/refresh du SDK et confirmations obligatoires. Aucun Google OAuth, Turnstile ni nouveau mécanisme Auth importé depuis la branche expérimentale.

### Alternatives considérées

Désactiver la confirmation ou importer le workflow expérimental : hors périmètre et sans problème concret justifiant ce remplacement.

### Conséquences

Les restrictions de l'envoi intégré demeurent un risque d'ouverture publique. Fournisseur, quota et redirections réellement lus sont documentés, sans confondre succès manuel et capacité publique.

### Références

[recipe-account.tsx](../components/recipe-account.tsx), [supabase-client.ts](../lib/supabase-client.ts), [TRD](TRD.md).

## ADR-003 — Séparer Supabase local, Cloud et Mailpit

**Statut :** Accepted
**Date :** 2026-10-17

### Contexte

Docker et Supabase CLI permettent des tests sans données ni destinataires de production. Un téléphone ne peut pas joindre le loopback du PC directement.

### Décision

Garder `.env.development.local` généré, `.env.local` conservé, profil Auth production distinct, Mailpit sur 54324 et proxy Next.js `/__supabase` limité au développement local. Conserver le correctif PostgREST local v14.18.

### Alternatives considérées

Tester l'inscription sur des utilisateurs réels ou utiliser Cloud pour les fixtures : inutile et contraire à l'isolation demandée.

### Conséquences

Comptes locaux distincts, restart requis après sélection d'environnement ; pas de staging dédié inventé. Les scripts de démarrage déplacent seulement des marqueurs locaux puis les restaurent, sans modifier Cloud.

### Références

[config.toml](../supabase/config.toml), [start-local-supabase.mjs](../scripts/start-local-supabase.mjs), [next.config.mjs](../next.config.mjs), [TRD](TRD.md).

## ADR-004 — Conserver la planification locale par compte

**Statut :** Accepted
**Date :** 2026-10-17

### Contexte

Zustand persist stocke déjà les choix, plans et courses dans le navigateur ; aucune table Cloud de planification n'existe.

### Décision

Conserver les clés visiteur/compte et documenter explicitement l'absence de synchronisation multi-appareil. Ne pas ajouter de table ou de service pour la seule cohérence documentaire.

### Alternatives considérées

Synchronisation Cloud immédiate : changement de périmètre avec nouvelles exigences de conflits et confidentialité.

### Conséquences

Perte possible à l'effacement du navigateur, pas de restauration depuis Supabase. La séparation de comptes est logique et ne chiffre pas le stockage sur appareil partagé.

### Références

[store.ts](../lib/store.ts), [account-provider.tsx](../components/account-provider.tsx), [APP_FLOW](APP_FLOW.md).

## ADR-005 — Écritures communautaires atomiques et permissions SQL

**Statut :** Accepted
**Date :** 2026-10-17

### Contexte

Recettes privées, publication administrative et rapprochement des ingrédients nécessitent une autorisation serveur.

### Décision

Conserver PostgreSQL/RLS et RPC validées, bucket de photos privé, rôle administrateur issu des données serveur. Les auteurs peuvent utiliser leurs recettes pending/rejected sans publication ; seuls les administrateurs éditent le pending.

### Alternatives considérées

Écriture directe navigateur ou rôle de métadonnées utilisateur : non retenus. Le déploiement de la migration du workflow enrichi est une opération distincte encore non réalisée dans Cloud.

### Conséquences

Les gardes internes, grants effectifs et `search_path` sont à vérifier sur chaque environnement. Le journal de décision est porté par les champs de recette, pas un historique exhaustif. Les médias et FK imposent une stratégie de suppression à définir.

### Références

[migrations](../supabase/migrations/), [BACKEND_SCHEMA](BACKEND_SCHEMA.md).

## ADR-006 — Limiter les invitations de modération au local

**Statut :** Accepted
**Date :** 2026-10-17

### Contexte

Le code de `main` sait livrer dans Mailpit mais n'a aucun transport applicatif de production. L'appel après sauvegarde échouait en production et affichait un avertissement malgré la recette enregistrée.

### Décision

Déclencher automatiquement `/api/recipe-notifications` seulement en développement avec Supabase loopback. Conserver endpoint, transport Mailpit, tests, file et migrations historiques. Ne pas créer de cron ni ajouter de fournisseur externe.

### Alternatives considérées

Retirer toute la file et son trigger : ferait perdre le parcours local et nécessiterait une migration distante inutile. Ajouter Resend/Mailjet : non demandé.

### Conséquences

La soumission et la modération restent indépendantes de l'envoi. Aucun e-mail de modération ou de décision en production ; la file versionnée peut croître si déployée. Les administrateurs consultent l'interface. La migration créant cette file est absente de Cloud lors de l'audit.

### Références

[personal-recipe-form.tsx](../components/personal-recipe-form.tsx), [recipe-notifications.ts](../lib/recipe-notifications.ts), [BACKEND_SCHEMA](BACKEND_SCHEMA.md).

## ADR-007 — Ne pas installer Mailjet ou Resend

**Statut :** Accepted
**Date :** 2026-10-17

### Contexte

Aucun SDK/transport de ces services sur `main`. Vercel conserve une variable Resend ; la lecture Cloud confirme SMTP intégré sans hook externe. Les anciens documents invitaient à provisionner Resend après un échec d'acceptation de conditions.

### Décision

Abandonner cette instruction d'installation. Conserver Auth et Mailpit. Préparer le retrait de la variable inutile, sans modifier le SMTP ni les secrets distants pendant la mission.

### Alternatives considérées

Provisionnement Marketplace, nouveau transport commercial ou suppression automatique d'une clé active : non retenus.

### Conséquences

Une recherche du mot `resend` doit préserver `supabase.auth.resend`, qui est une méthode d'Auth. L'absence de consommation applicative ne suffit pas sans contrôle SMTP distant.

### Références

[TRD : état e-mail](TRD.md), [configuration](../supabase/config.toml), [roadmap](IMPLEMENTATION_PLAN.md).

## ADR-008 — Retirer la variable Vercel Resend après accord

**Statut :** Proposed
**Date :** 2026-10-17

### Contexte

`RESEND_API_KEY` existe sur `recipe-app` dans Production et Preview. Aucune valeur déchiffrée ; aucun usage dans le code de référence ni SMTP externe actif.

### Décision

Proposer la suppression de cette seule variable sur ces deux cibles après relecture du périmètre et autorisation explicite. Aucune suppression ni révocation réalisée par cette branche.

### Alternatives considérées

La garder temporairement pour revue (état actuel) ; changer SMTP ou révoquer une clé chez le fournisseur (hors périmètre).

### Conséquences

Recontrôler code, SMTP et cibles juste avant l'opération. Une suppression de variable ne modifie pas automatiquement les déploiements déjà construits ; tout redéploiement reste soumis à autorisation.

### Références

[TRD](TRD.md), [journal d'audit](IMPLEMENTATION_PLAN.md).

## ADR-009 — Imports manuels traçables et seeds locaux

**Statut :** Accepted
**Date :** 2026-10-17

### Contexte

Le dépôt conserve les sources Crous, lots City Café, corrections SQL et attributions d'images. Les générateurs sont manuels ; aucune exécution périodique Odélis démontrée.

### Décision

Conserver les artefacts, migrations et historique des lots ; distinguer recette historique/importée/communautaire et source vérifiée/interprétée. Les seeds destructifs sont réservés au local. Pas d'automatisation nouvelle dans cette mission.

### Alternatives considérées

Supprimer les lots déjà synchronisés ou réécrire les migrations : perte de traçabilité. Ajouter un pipeline de scraping : évolution à étudier.

### Conséquences

Ne pas réimporter sans correction documentée ; relire proportions, interprétations et photos approximatives. Les accès publics à des contenus ne constituent pas une licence générale présumée.

### Références

[new-import](../supabase/new-import/), [IMPLEMENTATION_PLAN](IMPLEMENTATION_PLAN.md), [BACKEND_SCHEMA](BACKEND_SCHEMA.md).

## ADR-010 — Sept documents canoniques et maintenance par session

**Statut :** Accepted
**Date :** 2026-10-17

### Contexte

README et quatre guides décrivaient parfois différemment planification, préférences et production.

### Décision

Consolider en sept fichiers dans `docs`, README d'accueil, AGENTS opérationnel et un seul `.env.example`. Garder une description détaillée canonique par sujet, des liens relatifs et un journal daté après chaque tâche.

### Alternatives considérées

Conserver les anciens guides en doublon : risquer de nouvelles divergences. Supprimer les sources d'import : sans rapport avec la consolidation documentaire.

### Conséquences

Les tâches historiquement cochées mais partielles redeviennent TODO avec leur preuve et leur historique. Les faits inconnus sont `[À CONFIRMER]`, les évolutions ne sont pas présentées comme livrées.

### Références

[README](../README.md), [AGENTS](../AGENTS.md), [IMPLEMENTATION_PLAN](IMPLEMENTATION_PLAN.md).
