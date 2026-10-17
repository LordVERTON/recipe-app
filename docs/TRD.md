# Broco-Chou — Architecture technique

**Objectif :** Décrire les composants, environnements, conventions et limites techniques vérifiés.
**Dernière mise à jour :** 2026-10-17
**Statut :** EXISTANT audité depuis `main/e89d109` ; configuration Cloud lue sans modification.
**Documents liés :** [Produit](PRD.md), [Parcours](APP_FLOW.md), [Schéma backend](BACKEND_SCHEMA.md), [Design](DESIGN_BRIEF.md), [Roadmap et tests](ROADMAP.md), [ADR](DECISIONS.md).

## Stack et organisation

Versions résolues par [package-lock.json](../package-lock.json), qui fait foi pour `npm ci` ; les intervalles du manifeste ne sont pas des versions installées garanties.

| Technologie | Version résolue | Rôle |
| --- | --- | --- |
| Next.js | 16.2.6 | App Router, pages et handlers API ; développement Webpack |
| React / React DOM | 19.2.6 | Interface et état des composants |
| TypeScript | 5.7.3 | Typage strict, alias `@/*` vers racine |
| Tailwind CSS / `@tailwindcss/postcss` | 4.3.0 | Styles utilitaires et tokens CSS |
| Zustand | 5.0.13 | Store client et middleware persist |
| Framer Motion | 12.38.0 | Swipe et transitions |
| `@supabase/supabase-js` | 2.117.3 | Auth, REST, RPC, Storage |
| Supabase CLI | 2.120.0 | Développement local et migrations |
| Radix Dialog | 1.1.15 | Exemple de primitive shadcn/ui ; les versions Radix diffèrent par paquet |
| Lucide React | 0.564.0 | Icônes |
| React Hook Form / resolvers / Zod | 7.75.0 / 3.10.0 / 3.25.76 | Outillage de formulaires disponible ; le formulaire personnel utilise FormData et validation manuelle |
| Vercel Analytics | 1.6.1 | Composant chargé uniquement en production |
| ESLint / typescript-eslint | 10.10.0 / 8.70.0 | Analyse statique |
| PostCSS | 8.5.14 | Traitement CSS ; versions transitives à examiner séparément |

Autres dépendances conservées : date-fns 4.1.0, react-day-picker, Sonner, Vaul, Recharts, embla-carousel, cmdk, next-themes, class-variance-authority, clsx et tailwind-merge. Leur présence dans les primitives ne prouve pas une fonction métier utilisée. Le manifeste est nommé `my-project` version `0.1.0`, privé, et annonce `npm@12.0.2`. Node ≥22 est le prérequis documenté ; cette session utilise Node 26.8.2. PostgreSQL local : major 17 ; PostgREST local forcé à `v14.18` par le script de démarrage.

Ces choix sont conservés pour stabilité et coûts minimaux. Aucun nouveau framework ni SDK d'e-mail ajouté. `shadcn/ui` est du code dans `components/ui/`, pas un service distant.

| Répertoire | Responsabilité |
| --- | --- |
| `app/` | Layout, `/`, import manuel et API |
| `components/` | Orchestrateur, compte, écrans et primitives UI |
| `hooks/` | Hooks UI ; certains doublons historiques dans `components/ui/` |
| `lib/` | Types, store, calculs, mapping Supabase, images et notifications |
| `public/` | Icônes, images locales et placeholders |
| `scripts/` | Exploitation locale, contrôles et préparation des imports |
| `supabase/` | Configuration, migrations, seeds, imports sources et snippets historiques |
| `styles/` | CSS générique historique ; seul `app/globals.css` est importé par le layout |
| `docs/` | Sept références canoniques ; aucune seconde roadmap |

## Architecture

```mermaid
flowchart LR
  U[Navigateur React] --> A[AccountProvider]
  U --> Z[Zustand]
  Z --> L[localStorage par compte]
  A --> C[Client Supabase JS]
  C --> AUTH[Supabase Auth]
  C --> REST[REST et RPC PostgreSQL]
  REST --> RLS[RLS et fonctions validées]
  C --> ST[Storage privé]
  U --> N[API Next.js]
  N --> IMP[Import manuel serveur en développement]
  N --> MAIL[Notifications Mailpit locales]
  AUTH --> SMTP[Envoi intégré Cloud ou Mailpit local]
```

`app/page.tsx` rend `BrocoChouApp`. Les onglets et panneaux sont des états React, sans route dédiée. Le navigateur lit directement Supabase avec la clé anonyme et la session. Les écritures communautaires utilisent des RPC validées et RLS ; les API Next.js ne sont pas un backend universel. Pas de `@supabase/ssr`, de middleware Auth ni de sessions serveur propres au projet.

`AccountProvider` diffère les opérations Supabase hors du callback Auth pour éviter le verrou de session ; l'identité et un numéro de génération isolent les réponses asynchrones. Il hydrate l'espace local avant de rendre les écrans. Les recettes sont paginées par 500, puis filtrées si elles n'ont aucun ingrédient ; les photos privées sont signées pour 7200 secondes. La table de lecture peut être configurée ; RPC, API d'import et modération ciblent toujours `public.recipes`.

### État local et données Cloud

| Donnée | Propriétaire / persistance |
| --- | --- |
| Compte, confirmation, sessions | Supabase Auth ; session navigateur du SDK |
| Catalogue, ingrédients, recettes personnelles, décisions | PostgreSQL avec RLS |
| Photos communautaires | Storage `recipe-photos`, accès signé selon visibilité |
| Swipe, acceptées, refusées, favoris | Zustand persist / navigateur |
| `weeklyPlan`, `recipeHistory`, `preferences`, `householdSize`, `groceryList`, onboarding | Zustand persist / navigateur |
| `recipeCatalog`, file `recipes`, index, `currentStep` | État mémoire, exclus de `partialize` |
| Onglet, modales, filtres éditeur, coches de préparation | État React éphémère |

Clé visiteur : `broco-chou-storage` ; compte : `broco-chou-account-<uuid>`. `switchPlanningAccount` utilise temporairement un adaptateur sans écriture pour ne pas écraser l'ancien compte pendant le reset, puis hydrate la nouvelle clé. Aucune migration distante ni synchronisation de plans. Les objets `Date` persistés sont des chaînes JSON ; les consommateurs doivent employer `new Date(...)` avant calcul/comparaison. Le type `GroceryList` existe mais le store persiste directement `GroceryItem[]` sans date de génération.

### To Eat List — état observé et contrat à définir

Le propriétaire a identifié [To Eat List](https://app.notion.com/p/To-Eat-List-4d3b60cd4d4442d5b4f1ff0fa0b2a9b0) comme référentiel durable demandé. Au cours de la revue du 2026-10-17, lecture seule de la page et des trois sources suivantes ; aucune écriture Notion ni configuration de connecteur dans l'application. Les accès du plugin de cette session sont distincts des capacités du code Broco-Chou.

| Source Notion | Identifiant de source | Schéma observé et écart technique |
| --- | --- | --- |
| [Recettes](https://app.notion.com/p/2e730fe88d9a4064b54fd0361bc014d4) | `c1c0afd4-a307-432e-89dc-848c69343c25` | Propriétés `Name`, `Repas`, `Tags`, `Ingrédients` (relation), `Durée totale`, `URL`, dates, favoris/essayé. Pas de propriétés dédiées portions, instructions ou ID Broco-Chou dans le schéma lu |
| [Ingrédients](https://app.notion.com/p/02e2e66e177540f99676a22dc3c40d9d) | `254e9916-b826-4576-bcd7-9665ca19fde8` | `Article`, `Catégorie`, `Rayon`, `Quantité`, relation `Recettes`, remarques et achat. La quantité portée par un ingrédient partagé ne décrit pas à elle seule la quantité par recette |
| [Meal Plan](https://app.notion.com/p/0015f4cce9f84dfb90c4a5bcc753b5ef) | `ae848e1d-de23-4643-b85b-2689d54b7154` | `Jour`, `Date`, textes `Petit-Déjeuner`, `Déjeuner`, `Dîner`, `Snacks` ; pas de relation recette dans le schéma lu. Source candidate de menus, pas preuve d'une synchronisation des plans navigateur |

Deux lignes de recettes ont été échantillonnées et [une fiche détaillée](https://app.notion.com/p/360173c57e0481f38766fbe5aa7445a6) lue : son corps contient informations culinaires, ingrédients/quantités, étapes et ID métier ; l'image est une URL Pexels externe présente aussi en couverture. Certains libellés d'étapes de cet échantillon paraissent tronqués ; qualité/complétude à contrôler avant toute reprise automatique. L'existence de ces données dans Notion ne prouve aucun transfert depuis l'application actuelle. Les réponses fetch portent une date d'instantané « as of 2026-05-14 », antérieure à cette revue : fraîcheur non garantie. L'échantillon n'est pas un audit de tout le catalogue.

Recherche dans frontend, API, scripts, migrations, dépendances et exemple de configuration : aucun client Notion, mapping d'identifiants Notion/Supabase, flux de synchronisation ni test de restauration To Eat List trouvé. Les correspondances d'ID, blocs de contenu, unités/portions, catégories, médias durables, auteurs/modération, conflits et suppressions restent un contrat à définir. **Exigence produit** : Notion fait autorité et doit rester récupérable indépendamment de Broco-Chou ; **état technique** : non implémenté. Les tâches et critères uniques sont DB-05/06 dans la [roadmap](ROADMAP.md), sans nouvelle architecture imposée ici.

### Calculs réellement appelés

Le store ordonne les suggestions par saison et mélange aléatoire. Le générateur puise exclusivement dans les recettes acceptées, exclut les doublons, pénalise un ingrédient principal utilisé ≥2 fois de 30 points, ≥3 fois de 50 points supplémentaires ; bonus saison +20, mois +10. Il remplit déjeuner, dîner, petit-déjeuner puis dessert selon préférences, pour aujourd'hui à J+6.

Le score d'équilibre du store totalise saison 20, variété d'ingrédients 20, protéines 20, légumes 15, desserts 10 et non-répétition 15. C'est un indicateur heuristique dépendant de tags et sous-chaînes. `lib/recipe-logic.ts` expose aussi score avancé, répétition à 21/30 jours, conseils et suggestions ; `scoreRecipe`, `sortRecipesForSwipe` et `preventRepetition` ne pilotent pas le swipe actuel. `planning-summary.tsx` utilise conseils/répétition mais n'est pas monté par l'orchestrateur. Ne pas présenter ces helpers comme garanties de filtrage alimentaire.

Quantités : fractions simples ou préfixes numériques, multiplication par `householdSize`, addition de mêmes suffixes d'unité ; sinon concaténation. Pas de conversion inter-unités et pas de division par portions d'origine. Voir les dettes précises dans la [roadmap](ROADMAP.md).

## Environnements et démarrage

### Local Windows / PowerShell

Prérequis : Node ≥22, npm, Docker Desktop démarré avec conteneurs Linux. Les dépendances incluent la CLI épinglée ; première exécution susceptible de télécharger les images Docker.

```powershell
npm ci
npm run supabase:start
npm run supabase:env
npm run mailpit
npm run dev
```

Les commandes sont séquentielles ; Next.js peut tourner dans un second terminal. `supabase:start` démarre aussi Mailpit. `mailpit` le relance si nécessaire et configure l'application locale. Redémarrer Next.js après un changement d'environnement. Sans Supabase configuré, la découverte avec mocks reste utilisable ; le compte et la soumission sont indisponibles.

| Service local | Adresse |
| --- | --- |
| Next.js | `http://localhost:3000` |
| API | `http://127.0.0.1:54321` |
| PostgreSQL | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` — identifiants de développement locaux |
| Shadow PostgreSQL | Port 54320 |
| Studio | `http://127.0.0.1:54323` |
| Mailpit | `http://127.0.0.1:54324` |

`start-local-supabase.mjs` masque temporairement les seuls marqueurs de liaison `project-ref`, `linked-project.json`, `pooler-url` dans `.local-start-link-backup`, démarre la pile et les restaure en `finally`. Il fixe `.temp/rest-version` à `v14.18` pour corriger l'erreur intermittente `PGRST303: JWT issued at future` de PostgREST 14.5. Ce correctif est décrit dans la [release PostgREST 14.18](https://github.com/PostgREST/postgrest/releases/tag/v14.18). Ne pas réinitialiser la base pour corriger une session.

```powershell
# Pour recréer les conteneurs avec leurs volumes conservés
npm run supabase:stop
npm run supabase:start
npm run supabase:env
node scripts/verify-local-jwt.mjs
```

L'arrêt normal conserve les données ; `supabase stop --no-backup` efface des volumes locaux et n'est pas une réparation normale. `supabase login` authentifie la CLI, pas les sessions de l'application. Une sauvegarde de liaison déjà présente interrompt volontairement le démarrage : vérifier son contenu avant toute reprise.

### Configuration des fichiers et secrets

[`.env.example`](../.env.example) est l'unique modèle versionné, sans secret réel. Ne pas le charger en production avec ses valeurs vides ; `supabase:env` remplit directement le fichier local à partir de la pile en cours, vérifie l'hôte loopback et conserve les autres lignes ainsi que `.env.local`.

| Support | Usage |
| --- | --- |
| `.env.example` | Inventaire et commentaires ; copie éventuelle pour Cloud/local manuel |
| `.env.development.local` | Valeurs locales prioritaires en `npm run dev`, générées par `supabase:env` |
| `.env.local` | Valeurs de la machine, éventuellement Cloud ; également chargées au build de production local |
| Variables Vercel | Valeurs des déploiements Production/Preview/Development ; aucune exportation secrète nécessaire pour cet audit |
| `supabase/config.toml` | Ports et paramètres de services/Auth locaux, profil distant séparé ; aucun secret SMTP de production |

Priorité Next.js : environnement du processus, `.env.<mode>.local`, `.env.local` (sauf test), `.env.<mode>`, `.env`. Le build ignore `.env.development.local`, utilise les variables Production ou `.env.local` de la machine. Les scripts Node autonomes ne chargent pas ces fichiers automatiquement : examiner chacun avant usage. [Documentation Next.js](https://nextjs.org/docs/app/guides/environment-variables).

| Variable | Portée | Nécessité réelle |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Publique | Catalogue/Auth/Storage, URL locale ou Cloud |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publique | Clé anonyme ; sécurité reposant sur RLS, jamais une clé de service |
| `NEXT_PUBLIC_SUPABASE_RECIPES_TABLE` | Publique, facultative | `recipes` par défaut, seulement pour lecture catalogue |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur uniquement | Import de développement et notification Mailpit ; pas nécessaire au parcours navigateur de production |
| `CRON_SECRET` | Serveur, facultative | Autorisation GET de reprise locale ; aucun cron configuré |
| `PEXELS_API_KEY` | Script uniquement | Scripts manuels d'enrichissement/téléchargement ; pas API images de l'application |
| `SUPABASE_PROD_SERVICE_ROLE_KEY` | Script privilégié uniquement | Contrôles City Café lisant `.env.local` ; pas variable runtime, jamais à partager avec Preview/local |
| `NEXT_PUBLIC_SUPABASE_LOCAL_PROXY` | Dérivée par `next.config.mjs` | Ne pas définir manuellement ; activée seulement en développement HTTP loopback |
| `TEST_APP_URL`, `PLAYWRIGHT_MODULE` | Processus de test | Extension API du test personnel et chemin d'installation Playwright externe |

Ne jamais journaliser JWT, clés, mots de passe, liens d'Auth à session réelle ou valeurs de fichiers `.env*.local`. `.gitignore` exclut `.env*.local`, `.vercel/`, `.next/`, `.temp/`, `node_modules` et `*.tsbuildinfo`. Les paramètres publics sont incorporés au bundle ; modifier une variable Vercel ne met pas à jour un déploiement déjà construit.

### Téléphone sur le réseau local

```powershell
npm run dev:local -- --hostname 0.0.0.0
```

Cette commande exige une pile locale démarrée. Ouvrir `http://<IPv4-du-PC>:3000`, vérifier `ipconfig`, réseau privé et pare-feu Node/TCP 3000, éviter le Wi-Fi invité isolé. `allowedDevOrigins` contient actuellement `172.20.10.3` et `192.168.1.5` : adapter à l'adresse réelle. Le navigateur envoie Auth/REST/Storage à l'origine Next.js via `/__supabase` ; Next.js contacte le loopback du PC. Pas d'accès direct au loopback du téléphone ni de proxy Cloud/production. Ajouter l'origine exacte du téléphone dans `auth.additional_redirect_urls` avant redémarrage local ; les liens Mailpit peuvent sinon revenir vers localhost. Les fonctions navigateur exigeant un contexte HTTPS sécurisé peuvent manquer en HTTP LAN ; aucune PWA n'est livrée.

Pour revenir volontairement à Cloud en développement, renommer `.env.development.local` en `.env.development.disabled.local`, vérifier la cible de `.env.local` et redémarrer. Le remettre à son nom initial réactive le local. Les comptes locaux et Cloud sont distincts. Ne pas utiliser de vraies données personnelles pour les tests.

### Autonomie hors ligne — périmètre de vérification

Le propriétaire confirme que « recipe app » désigne ce dépôt Broco-Chou (`supabase/config.toml` : `project_id="recipe-app"`). Les scripts npm, Supabase CLI, Auth/Storage et Mailpit locaux sont configurés ; les polices utilisent les piles système de `app/globals.css`. Les recherches/rendus isolés et actions du store ont été exécutés sans réseau avec données et stockage fictifs ; aucun serveur frontend ni service Supabase n'a été démarré pour cette revue. L'essai de lecture SQL locale échoue car le moteur Docker Desktop Linux est indisponible. L'autonomie complète reste à vérifier dans OPS-05.

Sur un poste préparé, les dépendances npm et images Docker doivent déjà être présentes. Tester frontend, catalogue, Auth/confirmation Mailpit, création/photo, planning et courses avec WAN coupé, cibles Supabase loopback vérifiées. La première installation npm et le téléchargement des images Docker peuvent demander Internet. Ne pas exécuter de reset ou de seed Cloud pour préparer cet environnement.

Restent liés au réseau : Supabase Cloud lorsque cette cible est choisie, photos Pexels distantes, téléchargements Pexels des imports, opérations Git distantes/Vercel et future synchronisation Notion. `npm.cmd run offline:check` échoue sur les URLs Pexels dans le seed et 12 imports ; les chemins locaux testés passent avant cet échec. Ce contrôle ne mesure pas à lui seul l'autonomie de tous les services. Pas de cache applicatif complet, service worker/PWA ou file de synchronisation hors ligne démontré. [OPS-05 et DEBT-01](ROADMAP.md) suivent les vérifications et corrections ; cette documentation ne déclare pas la version publique utilisable entièrement hors ligne.

### Production et Preview

Production : [recipe-app-alpha-wine.vercel.app](https://recipe-app-alpha-wine.vercel.app), équipe `vertondan-9283s-projects`, projet `recipe-app`, Supabase `cbwrvcifxcqyrgtcpvbd`, région observée `eu-west-1`. `vercel.json` impose `npm ci`, sans cron. Pas de workflow GitHub Actions versionné ni d'instance staging dédiée. Le branchement Git automatique et le commit effectivement servi doivent être vérifiés dans Vercel avant une livraison ; le seul contenu de `main` ne prouve pas le déploiement des migrations.

Lecture Vercel le 2026-10-17 : trois variables publiques Supabase et `RESEND_API_KEY`, chacune ciblant Production et Preview ; pas de `SUPABASE_SERVICE_ROLE_KEY` ni `CRON_SECRET` dans la liste retournée. Valeurs non déchiffrées. Preview peut donc atteindre la même configuration Cloud ; vérifier les cibles sans exporter de secret, et ne jamais supposer l'isolation de ses écritures. `NODE_ENV=production` dans Preview interdit également l'API save et l'envoi Mailpit.

Déployer seulement après revue de branche, contrôles et autorisation du propriétaire. Les migrations SQL ne sont pas exécutées par le build Vercel. L'audit initial n'a effectué aucune écriture de production ni déploiement ; la livraison ultérieure autorisée sur `main` et ses contrôles sont consignés dans le [journal de session](ROADMAP.md).

## Auth et services d'e-mail

Lecture effective de l'API de gestion Supabase le 2026-10-17, paramètres non secrets uniquement : `site_url` et `uri_allow_list` = URL Vercel ; `mailer_autoconfirm=false` ; `smtp_host/port` absents ; utilisateur et mot de passe SMTP non configurés ; `hook_send_email_enabled=false` ; `smtp_max_frequency=60` ; `rate_limit_email_sent=2`. Cela confirme actuellement l'envoi intégré, sans SMTP externe. Les fichiers versionnés seuls n'auraient pas suffi.

Le profil `[remotes.production]` garde confirmations et URL publique distinctes du local. Modifier TOML ne déploie pas ces réglages. Historique repris de l'ancien guide : profil appliqué/vérifié le 2026-10-09 ; liens temporaires générés administrativement testés sans envoi avec retour vers Vercel même pour une demande localhost ; `127.0.0.1` aurait encore été accepté hors liste explicite. Ces tests ne sont pas rejoués et ne prouvent pas la délivrabilité. Utiliser l'URL publique et un nouveau lien, car les anciens e-mails gardent leur URL d'origine. Avant toute future application de configuration, lecture seule possible avec `npx supabase config diff --project-ref cbwrvcifxcqyrgtcpvbd` : vérifier que le profil `remotes.production` est sélectionné, jamais appliquer automatiquement.

Limites officielles consultées le 2026-10-17 : le service intégré est destiné aux essais, envoie aux seules adresses préautorisées des membres de l'organisation, limite actuellement à deux messages par heure et n'offre pas de SLA de livraison. Les membres effectivement autorisés du projet sont [À CONFIRMER] ; l'allowlist administrateur de recettes n'est pas la liste des destinataires SMTP. [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

Auth impose des limites serveur et des réponses 429 ; la configuration locale et l'UI imposent une minute entre demandes de confirmation. Les quotas effectifs autres que les paramètres lus restent [À CONFIRMER]. Le délai UI n'est pas une protection serveur et aucun CAPTCHA n'est ajouté. [Limites Auth](https://supabase.com/docs/guides/auth/rate-limits). Évaluer un SMTP externe seulement lors d'une décision explicite d'ouverture publique ; ne pas désactiver les confirmations.

Mailjet : aucune dépendance, variable active ou transport dans le code de `main`. Le mot `resend` dans `supabase.auth.resend` signifie renvoi de confirmation, sans rapport avec le fournisseur Resend. `RESEND_API_KEY` reste une variable distante candidate au retrait, sans consommation applicative. L'ancien projet d'installation Resend bloqué par `integration_terms_acceptance_required` est abandonné, pas une tâche à reprendre automatiquement. Plan de retrait : vérifier à nouveau projet/cibles et SMTP, faire approuver la suppression de la seule variable Production/Preview, puis contrôler la configuration ; aucune révocation de clé, modification SMTP ni installation Marketplace implicite.

Notifications de modération : transport local Mailpit, outbox durable et reprise manuelle conservés. Le formulaire sollicite désormais l'API seulement en développement avec loopback ; aucune fausse alerte d'invitation en production. Tables, RPC et endpoint sont conservés pour les tests locaux, sans service d'envoi de production.

## Sécurité et exploitation

- Auth SDK conservé : inscription, connexion mot de passe, renvoi, persistance, refresh et déconnexion locale. Pas de remplacement d'authentification.
- RLS et RPC `SECURITY DEFINER` à `search_path=''` protègent les recettes privées. Droits administrateur fondés sur données serveur ; différences Cloud/versionné dans [BACKEND_SCHEMA](BACKEND_SCHEMA.md).
- Photo : bucket privé, chemin par uid, MIME et taille limités, URL signée. Protection par type déclaré, pas preuve d'analyse antivirus ou retrait EXIF.
- Endpoints import : aucune Auth sur page/parse/images ; `save` interdit en production mais n'impose ni rôle ni cible locale en développement. Ne pas exposer le serveur de développement configuré avec une clé Cloud ; sécurisation à planifier avant extension.
- Pas de rate limiter applicatif, validation de taille globale ni schéma Zod sur API import ; payloads mal typés peuvent produire une erreur 500. Ne pas annoncer une protection inexistante.
- Pas de sauvegarde du localStorage dans Cloud ; snapshots/export/restauration des données hébergées et médias à définir et tester, sans supposer les fonctions d'une offre payante.
- Vercel Analytics activé dans le layout en production, sans événements produit. Pas de service d'erreurs centralisé/Sentry ni de monitoring métier prouvé. Erreurs UI/toasts et console de développement sont les mécanismes actuels.
- Conformité RGPD [À CONFIRMER] : finalités, contact, information, durée de conservation, suppression/export des comptes et médias, sous-traitants et traitement Analytics. Aucune page juridique ni certification dans `main`.

## Qualité, Git et exigences non fonctionnelles

`tsconfig.json` active `strict` et `noEmit`. Attention : `next.config.mjs` a `typescript.ignoreBuildErrors=true` ; un build réussi ne remplace donc pas `npx tsc --noEmit`. Images `unoptimized:true` et plusieurs `<img>` expliquent quatre avertissements ESLint. Aucun runner unitaire ni commande `test` ; scripts d'intégration Node et un test navigateur Playwright externe. Ne pas installer une nouvelle dépendance applicative pour les rejouer.

Commandes : `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run offline:check`, `node scripts/verify-documentation.mjs` puis tests locaux décrits dans le [journal](ROADMAP.md). Après changement de branche, les types générés sous `.next` peuvent encore mentionner les routes expérimentales : régénérer les artefacts avant d'attribuer ces erreurs au code de `main`.

Pour la livraison de modération DB-01/COM-06 : `node scripts/verify-recipe-review-migrations.mjs` reconstruit les six migrations initiales dans une base éphémère du conteneur Docker local, puis applique ensemble le workflow et la correction d'adresse. Il contrôle préservation des lignes, droits, confirmation obligatoire, visibilité RLS, validation par un autre compte et nettoyage de sa base. Ses contrats Auth/Storage réduits complètent le test API `verify-personal-recipes.mjs` sur la pile locale réelle ; aucune donnée Cloud n'est copiée dans les fixtures. Livraison autorisée et contrôles Cloud en lecture seule : [BACKEND_SCHEMA](BACKEND_SCHEMA.md).

Branche de travail issue de `main`, aucun merge/cherry-pick expérimental, petits Conventional Commits et revue avant fusion. Aucun push direct sur `main`. Le dépôt ne dispose pas de contrôle CI versionné exécutant automatiquement TypeScript/tests ; l'installation Vercel est la seule configuration de build explicitement définie.

| Exigence | État observé / cible |
| --- | --- |
| Performance | Pagination de transport 500 lignes, mais chargement complet ; aucune mesure Lighthouse/Core Web Vitals jointe. Cible : mesurer avant optimiser |
| SEO | Métadonnées françaises et icône ; application client et pas de page recette indexable dédiée. Cible à définir |
| Responsive | UI mobile, adaptations `sm/md/lg`, détails dans le design ; aucun audit exhaustif d'appareils |
| Accessibilité | WCAG 2.2 AA est un objectif ; zoom bloqué dans viewport, contrôles iconiques sans labels et absence de réduction des animations restent à traiter |
| Sécurité | RLS, RPC et Storage privés ; audit npm 2026-10-17 : 12 alertes, dont Next critique. Analyse/correction séparée avec tests, pas de `audit fix --force` automatique |
| Résilience | Mocks/dernier état en erreur, conservation des recettes malgré notification échouée ; pas de garantie hors ligne intégrale |
| Disponibilité | Dépend de Vercel/Supabase et de leurs offres ; aucun SLO/SLA applicatif mesuré |

## Procédure de migration et diagnostic

Créer une nouvelle migration horodatée via `npm exec -- supabase migration new describe_the_change`. Ne jamais réécrire une migration déjà appliquée. Appliquer d'abord avec `npm exec -- supabase migration up --local`, inspecter Studio puis les tests. `npm run supabase:reset` détruit les seules données locales et rejoue migrations, `seed.sql` et `seed-local-admin.sql` ; réservé à une reconstruction locale assumée et sauvegardée, non exécuté par cette mission.

Erreur catalogue : vérifier Docker, cible locale, `supabase:env`, migrations/grants et redémarrage Next.js ; démarrer Supabase seul ne remplace pas une URL Cloud. Storage désactivé : activer dans TOML, arrêter/redémarrer avec volumes préservés, appliquer les migrations locales. Erreur JWT après veille : PostgREST 14.18 et procédure ci-dessus, sans reset distant.

`supabase migration list` compare l'historique au projet lié ; `--local` et `--linked` sont des cibles distinctes. L'ancienne procédure README de `db query --linked --file` et `db push --linked --yes` reste une opération privilégiée, manuelle, dépendante de la version CLI et soumise à accord ; ce n'est pas une commande d'installation locale. La livraison autorisée du 2026-10-17 a utilisé `db push --linked --skip-vault --yes` après contrôle de la cible, simulation et export sécurisé, puis vérification des données/droits et simulation finale sans migration restante. Aucune application de seed ni changement Vault. Ne jamais lancer `db reset --linked` ni un seed avec `truncate` sur Cloud.
